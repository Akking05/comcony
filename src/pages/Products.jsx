import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';
import { useLang } from '../lib/i18n.jsx';
import { rise } from '../lib/motion.js';
import { Reveal } from '../components/Reveal.jsx';
import { Button, Icon, StatusBlock } from '../components/ui/index.js';

/*
  Каталог — не витрина карточек, а продолжение упаковочного листа: то же
  плотное поле в край экрана, что и в номенклатуре главной, те же
  моноширинные клейма, тот же счёт позиций. Полей вокруг ячеек нет, зазора
  между ними нет: перечень читается как один лист, а не как двенадцать
  плиток на подложке.

  Отличие от листа ровно одно — снимок. Каталог и карточка позиции остаются
  единственным местом сайта, где есть фотографии; всё остальное графическое.

  Акцент в кадре не тратится ни на категорию, ни на стрелку: выбранное
  направление отмечено плотностью краски, а не цветом, и синий остаётся
  фокусной рамке и единственному целевому действию.
*/

/**
 * Поле уходит в край экрана, поэтому ему нужно снять поля страницы.
 * Мобильное и настольное значения совпадают (одинаковый clamp), поэтому
 * одного отрицательного отступа хватает на всех ширинах.
 */
const FULL_BLEED = { marginInline: 'calc(var(--spacing-margin-mobile) * -1)' };

/** Шаг печати строки. Дальше двенадцатой ячейки задержка не растёт: ждать нечего. */
const PRINT_STEP = 0.045;
const PRINT_MAX = 12;

/** Клеймо позиции: своего артикула в базе нет, обозначением служит slug. */
const designationOf = (product) => String(product.slug ?? '').toUpperCase();

/** Ключ направления. Позиция без категории попадает в собственную группу. */
const categoryKeyOf = (product) => product.category_slug || '';

function PhotoCell({ product, noPhotoLabel }) {
  if (!product.main_image) {
    // Заглушка, а не растянутый снимок соседа: чужая картинка в тендерном
    // перечне — это подмена позиции, а не украшение ячейки.
    return (
      <div className="flex aspect-4/3 w-full flex-col items-center justify-center gap-2 border border-dashed border-hairline bg-part-fill">
        <Icon name="image" size="2xl" className="text-stencil-dim" />
        <span className="font-label-2xs text-label-2xs uppercase text-ink-quiet">{noPhotoLabel}</span>
      </div>
    );
  }

  return (
    <div className="aspect-4/3 w-full overflow-hidden bg-part-fill">
      <img
        src={product.main_image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function Cell({ product, index, still, t }) {
  const hidden = still ? { opacity: 1, y: 0 } : { opacity: 0.06, y: 10 };

  return (
    <Reveal
      as="li"
      hidden={hidden}
      shown={{ opacity: 1, y: 0 }}
      duration={0.55}
      delay={Math.min(index, PRINT_MAX) * PRINT_STEP}
      className="flex min-w-0 border-b border-r border-hairline-soft"
    >
      <a
        href={`/products/${product.slug}`}
        className="group flex min-w-0 flex-1 flex-col gap-3 p-4 outline-none transition-colors hover:bg-stencil/6 focus-visible:bg-stencil/6 md:p-5"
      >
        <PhotoCell product={product} noPhotoLabel={t('catalog.no_photo')} />

        <span className="font-label-2xs text-label-2xs truncate text-ink-quiet">
          {designationOf(product)}
        </span>

        <span className="font-body-md text-body-sm text-ink">{product.name}</span>

        {product.category && (
          <span className="font-label-2xs text-label-2xs truncate uppercase text-stencil">
            {product.category}
          </span>
        )}

        <span className="mt-auto flex items-baseline justify-between gap-3 pt-3">
          <span className="font-label-2xs text-label-2xs text-ink-dim">{t('catalog.price')}</span>
          <span className="font-label-2xs text-label-2xs inline-flex items-center gap-2 uppercase text-ink-quiet transition-all group-hover:gap-3 group-hover:text-stencil group-focus-visible:text-stencil">
            {t('catalog.open')}
            <Icon name="arrow_forward" size="xs" />
          </span>
        </span>
      </a>
    </Reveal>
  );
}

function CellSkeleton() {
  return (
    <li className="flex min-w-0 border-b border-r border-hairline-soft">
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="aspect-4/3 w-full animate-pulse bg-part-fill"></div>
        <div className="h-3 w-1/2 animate-pulse bg-part-fill"></div>
        <div className="h-4 w-3/4 animate-pulse bg-part-fill"></div>
      </div>
    </li>
  );
}

export default function Products() {
  const { lang, t } = useLang();
  const still = useReducedMotion();

  // lang в зависимостях: смена языка — это новый запрос за каталогом.
  const { data, loading, error } = useApi((signal) => api.products(lang, signal), [lang]);

  const products = useMemo(() => data ?? [], [data]);

  /** Направления берём из самой выборки: отдельного публичного списка нет. */
  const categories = useMemo(() => {
    const found = new Map();

    for (const product of products) {
      const key = categoryKeyOf(product);
      if (!found.has(key)) found.set(key, product.category || t('catalog.uncategorized'));
    }

    return [...found].map(([key, title]) => ({ key, title }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, lang]);

  // null — «фильтр не трогали»: показываем всё, включая направления,
  // которые появятся в базе позже. Массив — осознанная выборка посетителя.
  const [chosen, setChosen] = useState(null);

  const isOn = (key) => chosen === null || chosen.includes(key);
  const filtered = chosen === null ? products : products.filter((one) => chosen.includes(categoryKeyOf(one)));

  const toggle = (key) => {
    const current = chosen ?? categories.map((one) => one.key);

    setChosen(current.includes(key) ? current.filter((one) => one !== key) : [...current, key]);
  };

  const reset = () => setChosen(null);

  return (
    <main className="relative z-10 mx-auto max-w-container-max px-margin-mobile pb-stack-xl md:px-margin-desktop">
      <header className="relative mb-stack-lg">
        {/* Клеймо по левому борту: маркировка ящика, а не подпись к заголовку. */}
        <span
          aria-hidden="true"
          className="font-label-sm text-label-sm absolute top-1 hidden uppercase text-ink-quiet xl:block"
          style={{
            writingMode: 'vertical-rl',
            letterSpacing: '0.34em',
            left: 'calc(var(--spacing-rail) * -1)',
          }}
        >
          {t('catalog.rail')}
        </span>

        <motion.h1
          {...rise(0.05)}
          className="max-w-3xl font-display-lg text-headline-lg-mobile text-ink md:text-display-lg"
        >
          {t('products.title')}
        </motion.h1>

        <motion.p {...rise(0.16)} className="mt-stack-sm max-w-[62ch] font-body-lg text-body-md text-ink-dim">
          {t('products.intro')}
        </motion.p>
      </header>

      {!loading && !error && categories.length > 1 && (
        <>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('catalog.filter_label')}>
            <span aria-hidden="true" className="font-label-2xs text-label-2xs mr-1 uppercase text-ink-quiet">
              {t('catalog.filter_label')}
            </span>

            {categories.map(({ key, title }) => (
              <button
                key={key || 'none'}
                type="button"
                aria-pressed={isOn(key)}
                onClick={() => toggle(key)}
                className={`font-label-sm text-label-sm cursor-pointer border px-4 py-2.5 uppercase transition-colors ${
                  isOn(key)
                    ? 'border-hairline text-ink kns-roll'
                    : 'border-hairline-soft text-ink-quiet hover:border-hairline hover:text-ink'
                }`}
              >
                {title}
              </button>
            ))}
          </div>

          <div className="mt-stack-sm flex flex-wrap items-baseline justify-between gap-4">
            <span aria-live="polite" className="font-label-2xs text-label-2xs text-ink-dim">
              {t('catalog.count', { count: filtered.length })}
            </span>

            {chosen !== null && (
              <Button variant="ghost" size="sm" iconEnd="arrow_forward" onClick={reset}>
                {t('catalog.reset')}
              </Button>
            )}
          </div>
        </>
      )}

      {loading && (
        <ul
          style={FULL_BLEED}
          className="mt-stack-md grid grid-cols-2 border-t border-b border-hairline md:grid-cols-3 lg:grid-cols-4"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <CellSkeleton key={index} />
          ))}
        </ul>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul
          style={FULL_BLEED}
          className="mt-stack-md grid grid-cols-2 border-t border-b border-hairline md:grid-cols-3 lg:grid-cols-4"
        >
          {filtered.map((product, index) => (
            <Cell key={product.slug} product={product} index={index} still={still} t={t} />
          ))}
        </ul>
      )}

      {/* Пустая выборка — не пустота, а пустой борт ящика: сказано, что
          произошло, и рядом лежит способ вернуть перечень. */}
      {!loading && !error && products.length > 0 && filtered.length === 0 && (
        <div
          style={FULL_BLEED}
          className="kns-roll mt-stack-md flex flex-col items-start gap-4 border-t border-b border-hairline px-margin-mobile py-stack-xl md:px-margin-desktop"
        >
          <h2 className="kns-display text-title-lg text-ink">{t('catalog.empty_title')}</h2>
          <p className="max-w-[46ch] font-body-md text-body-md text-ink-dim">{t('catalog.empty_text')}</p>
          <Button variant="ghost" iconEnd="arrow_forward" onClick={reset}>
            {t('catalog.reset')}
          </Button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="mt-stack-md">
          <StatusBlock icon="inventory_2" title={t('products.empty_title')} text={t('products.empty_text')} />
        </div>
      )}

      {error && (
        <div className="mt-stack-md">
          <StatusBlock icon="cloud_off" title={t('products.error_title')} text={t('products.error_text')}>
            <Button href="/contacts" variant="outline">
              {t('common.write_us')}
            </Button>
          </StatusBlock>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <p className="mt-stack-md max-w-[52ch] font-body-md text-body-sm text-ink-dim">{t('catalog.note')}</p>
      )}
    </main>
  );
}
