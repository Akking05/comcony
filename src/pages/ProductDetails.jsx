import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { useApi } from '../hooks/useApi.js';
import { api, track } from '../lib/api.js';
import { localeOf, useLang } from '../lib/i18n.jsx';
import { rise } from '../lib/motion.js';
import { applyMeta } from '../lib/seo.js';
import { Reveal } from '../components/Reveal.jsx';
import { QuoteForm } from '../components/QuoteForm.jsx';
import { Button, Icon } from '../components/ui/index.js';

/*
  Карточка позиции — тот же упаковочный лист, что и каталог, только на одну
  позицию: слева графа, справа значение, всё моноширинное и без полей вокруг.

  Здесь и в каталоге живут единственные фотографии сайта. Их ровно столько,
  сколько передал заказчик: позиция с девятью снимками показывает девять,
  позиция без снимков — заглушку, а не картинку соседа.

  Характеристик в базе почти нет, и это видно. Заглушка не притворяется
  значением: в тендерной закупке выдуманная цифра дороже пропуска.

  Единственный акцент экрана — кнопка запроса КП. Ни категория, ни стрелки,
  ни подписи акцентом не берутся.
*/

const formatSize = (bytes, t) => {
  if (!bytes) return '';

  const mb = bytes / (1024 * 1024);

  return mb >= 1
    ? t('product.size_mb', { value: mb.toFixed(1) })
    : t('product.size_kb', { value: Math.max(1, Math.round(bytes / 1024)) });
};

/** Заглушка вместо значения: моноширинная, в скобках, с пунктиром — не текст. */
function Missing({ children }) {
  return (
    <span className="font-label-md text-label-md whitespace-nowrap border-b border-dashed border-stencil-dim text-ink-quiet">
      <span aria-hidden="true">[</span>&nbsp;{children}&nbsp;<span aria-hidden="true">]</span>
    </span>
  );
}

function Shell({ t, children }) {
  return (
    <main className="relative z-10 mx-auto min-h-[60vh] max-w-container-max px-margin-mobile pb-stack-xl md:px-margin-desktop">
      <a
        href="/products"
        className="group font-label-2xs text-label-2xs mb-stack-md inline-flex items-center gap-2 uppercase text-ink-quiet transition-all hover:gap-3 hover:text-ink focus-visible:text-ink"
      >
        <Icon name="arrow_back" size="xs" />
        {t('product.back')}
      </a>

      {children}
    </main>
  );
}

/**
 * Снимки позиции: главный кадр и контактный лист под ним.
 *
 * Кадр вписывается, а не обрезается: покупателю радиостанции нужны корпус,
 * разъёмы и дисплей целиком, а не эффектный фрагмент.
 */
function PhotoStage({ product, still, t }) {
  const photos = useMemo(() => {
    const seen = new Set();
    const list = [];

    for (const photo of [
      ...(product.main_image ? [{ path: product.main_image, alt: product.name }] : []),
      ...(product.gallery ?? []),
    ]) {
      if (!photo.path || seen.has(photo.path)) continue;

      seen.add(photo.path);
      list.push(photo);
    }

    return list;
  }, [product]);

  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [product.slug]);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-4/3 w-full flex-col items-center justify-center gap-3 border border-dashed border-hairline bg-part-fill">
        <Icon name="image" size="3xl" className="text-stencil-dim" />
        <Missing>{t('catalog.no_photo')}</Missing>
      </div>
    );
  }

  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div>
      {/* Единственный поставленный момент страницы: кадр проявляется
          сверху вниз, как проходит по листу печатающая головка. */}
      <motion.div
        key={current.path}
        initial={still ? false : { clipPath: 'inset(0 0 100% 0)', opacity: 0.4 }}
        animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
        transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
        className="aspect-4/3 w-full overflow-hidden border border-hairline-soft bg-part-fill"
      >
        <img
          src={current.path}
          alt={current.alt || product.name}
          className="h-full w-full object-contain"
        />
      </motion.div>

      <div className="mt-stack-sm flex flex-wrap items-center justify-between gap-4">
        <span aria-live="polite" className="font-label-2xs text-label-2xs text-ink-quiet">
          {t('product.photo_of', { index: active + 1, count: photos.length })}
        </span>
        <span className="font-label-2xs text-label-2xs text-ink-dim">
          {t('catalog.photos', { count: photos.length })}
        </span>
      </div>

      {photos.length > 1 && (
        <ul className="mt-stack-sm grid grid-cols-4 border-t border-l border-hairline-soft sm:grid-cols-6">
          {photos.map((photo, index) => (
            <li key={photo.path} className="border-b border-r border-hairline-soft">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-current={index === active}
                aria-label={t('product.photo_of', { index: index + 1, count: photos.length })}
                className={`block aspect-square w-full cursor-pointer bg-part-fill transition-opacity ${
                  index === active ? 'opacity-100' : 'opacity-55 hover:opacity-100'
                }`}
              >
                <img
                  src={photo.path}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Строка упаковочного листа: слева графа, справа значение или заглушка. */
function Row({ label, children, still, index = 0 }) {
  const hidden = still ? { opacity: 1, x: 0 } : { opacity: 0.1, x: -10 };

  return (
    <Reveal
      as="div"
      hidden={hidden}
      shown={{ opacity: 1, x: 0 }}
      duration={0.5}
      delay={Math.min(index, 10) * 0.04}
      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline-soft py-3.5"
    >
      <dt className="font-label-2xs text-label-2xs uppercase text-stencil">{label}</dt>
      <dd className="font-label-md text-label-md text-right text-ink">{children}</dd>
    </Reveal>
  );
}

export default function ProductDetails({ slug }) {
  const { lang, t } = useLang();
  const still = useReducedMotion();
  const { data: product, loading, error } = useApi((signal) => api.product(slug, lang, signal), [slug, lang]);

  useEffect(() => {
    // Снятый с публикации товар — тоже 404: индексировать его не нужно.
    if (error?.status === 404) {
      applyMeta({
        title: t('meta.product.not_found_title'),
        description: t('meta.product.not_found_description'),
        locale: localeOf(lang),
        noindex: true,
      });
      return;
    }

    if (!product) return;

    // Свои заголовок, описание и картинку превью — общие теги маршрута
    // ставятся раньше, пока товар ещё грузится.
    applyMeta({
      title: `${product.name} | KAE Engineering`,
      description: product.short_description || product.full_description?.slice(0, 200),
      image: product.main_image,
      locale: localeOf(lang),
    });

    track({ type: 'product_view', path: window.location.pathname, product_slug: product.slug });
  }, [product, error, lang, t]);

  if (loading) {
    return (
      <Shell t={t}>
        <div className="h-10 w-2/3 max-w-xl animate-pulse bg-part-fill"></div>
        <div className="mt-stack-lg grid grid-cols-1 gap-stack-lg lg:grid-cols-12">
          <div className="aspect-4/3 w-full animate-pulse bg-part-fill lg:col-span-7"></div>
          <div className="space-y-4 lg:col-span-5">
            <div className="h-4 w-full animate-pulse bg-part-fill"></div>
            <div className="h-4 w-5/6 animate-pulse bg-part-fill"></div>
            <div className="h-4 w-2/3 animate-pulse bg-part-fill"></div>
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !product) {
    const notFound = error?.status === 404;

    return (
      <Shell t={t}>
        <div className="max-w-2xl border border-hairline-soft p-stack-lg">
          <h1 className="kns-display mb-stack-sm text-title-lg text-ink">
            {t(notFound ? 'product.not_found_title' : 'product.error_title')}
          </h1>
          <p className="mb-stack-md font-body-md text-body-md text-ink-dim">
            {t(notFound ? 'product.not_found_text' : 'product.error_text')}
          </p>
          <Button href="/products" variant="outline" iconEnd="arrow_forward">
            {t('product.back_button')}
          </Button>
        </div>
      </Shell>
    );
  }

  const description = product.full_description || product.short_description;
  const hasSpecs = product.key_specs.length > 0 || product.spec_groups.length > 0;

  return (
    <Shell t={t}>
      <motion.h1 {...rise(0.04)} className="max-w-4xl font-display-lg text-headline-lg-mobile text-ink md:text-display-lg">
        {product.name}
      </motion.h1>

      {/* Шапка листа: обозначение, направление, цена. Цены на сайте нет
          нигде — «по запросу» здесь не оговорка, а само значение. */}
      <dl className="mt-stack-md border-t border-hairline md:grid md:grid-cols-3 md:gap-x-gutter">
        <Row label={t('product.designation')} still={still} index={0}>
          {String(product.slug).toUpperCase()}
        </Row>
        <Row label={t('product.category_label')} still={still} index={1}>
          {product.category || <Missing>{t('product.no_data')}</Missing>}
        </Row>
        <Row label={t('product.price_label')} still={still} index={2}>
          {t('catalog.price')}
        </Row>
      </dl>

      <section className="mt-stack-lg grid grid-cols-1 gap-stack-lg lg:grid-cols-12 lg:gap-gutter">
        <div className="lg:col-span-7">
          <PhotoStage product={product} still={still} t={t} />
        </div>

        <div className="lg:col-span-5">
          {description ? (
            <p className="max-w-[62ch] font-body-lg text-body-md whitespace-pre-line text-ink-dim">
              {description}
            </p>
          ) : (
            <p className="max-w-[62ch] font-body-md text-body-md text-ink-dim">
              <Missing>{t('product.description_missing')}</Missing>
            </p>
          )}

          <div className="mt-stack-md">
            <Button href="#quote" variant="ghost" iconEnd="arrow_forward">
              {t('quote.title')}
            </Button>
          </div>

          {product.applications.length > 0 && (
            <ul className="mt-stack-md border-t border-hairline">
              {product.applications.map((application) => (
                <li key={application.title} className="border-b border-hairline-soft py-3.5">
                  <div className="font-body-md text-body-md text-ink">{application.title}</div>
                  {application.description && (
                    <p className="mt-1 font-body-sm text-body-sm text-ink-dim">{application.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {product.documents.length > 0 && (
            <ul className="mt-stack-md border-t border-hairline">
              {product.documents.map((document) => (
                <li key={document.file_path} className="border-b border-hairline-soft">
                  <a
                    href={document.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 py-3.5 text-ink transition-colors hover:text-stencil"
                  >
                    <span className="min-w-0 truncate font-body-md text-body-md">{document.title}</span>
                    <span className="font-label-2xs text-label-2xs shrink-0 text-ink-quiet">
                      PDF {formatSize(document.file_size, t)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Характеристики. В базе их почти нет, и страница этого не скрывает. */}
      <section className="mt-stack-xl">
        <h2 className="kns-display text-title-lg text-ink">{t('product.specs')}</h2>

        {hasSpecs ? (
          <dl className="mt-stack-md max-w-[78ch] border-t border-hairline">
            {product.key_specs.map((spec, index) => (
              <Row key={`key-${spec.name}`} label={spec.name} still={still} index={index}>
                {spec.value || <Missing>{t('product.no_data')}</Missing>}
              </Row>
            ))}

            {product.spec_groups.map((group) =>
              group.items.map((item, index) => (
                <Row
                  key={`${group.title}-${item.name}`}
                  label={group.title ? `${group.title} · ${item.name}` : item.name}
                  still={still}
                  index={product.key_specs.length + index}
                >
                  {item.value || <Missing>{t('product.no_data')}</Missing>}
                </Row>
              )),
            )}
          </dl>
        ) : (
          <div className="kns-roll mt-stack-md flex max-w-[78ch] flex-col items-start gap-4 border-t border-b border-hairline px-4 py-stack-lg">
            <Missing>{t('product.specs_missing_title')}</Missing>
            <p className="max-w-[58ch] font-body-md text-body-md text-ink-dim">
              {t('product.specs_missing_text')}
            </p>
          </div>
        )}
      </section>

      <section id="quote" className="mt-stack-xl scroll-mt-24">
        <h2 className="kns-display text-title-lg text-ink">{t('quote.title')}</h2>
        <QuoteForm product={product} />
      </section>
    </Shell>
  );
}
