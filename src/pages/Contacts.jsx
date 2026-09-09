import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';
import { useLang } from '../lib/i18n.jsx';
import { rise } from '../lib/motion.js';
import { Reveal, STEP } from '../components/Reveal.jsx';
import { faultsOf } from '../components/QuoteForm.jsx';
import { Placeholder } from '../components/home/parts.jsx';
import '../components/home/home.css';
import { Button, Icon } from '../components/ui/index.js';

/*
  Контакты — адресная сторона ящика: слева графа, справа значение.

  Реквизиты берутся только из базы (`texts`, группа «Контакты»): адрес,
  почта, телефон. Ни режим работы, ни координаты здесь больше не набиты
  в коде — прежняя страница печатала «09:00 — 18:00» и широту с долготой
  Астаны, которых заказчик не подтверждал. Пустая графа выглядит пустой
  графой: `[ значение ]`, а не правдоподобная строка.

  Форма пишет заявку в таблицу `requests` тем же публичным маршрутом, что и
  запрос КП с карточки позиции, — заявка сразу видна в админке. Проверка
  полей общая с запросом КП (`faultsOf`), чтобы два входа в одну таблицу
  не расходились в требованиях.

  Акцент в кадре один и принадлежит отправке.
*/

const EMPTY = { name: '', email: '', subject: '', message: '' };

/**
 * Конечное состояние появления. При `prefers-reduced-motion` оно же стоит
 * и до срабатывания наблюдателя: реквизиты видны сразу, переходов нет.
 */
const SHOWN = { opacity: 1, y: 0 };

/** Многострочное значение из базы: первая строка — само значение, дальше — уточнение. */
const lines = (value) =>
  String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

/**
 * Графа реквизитов. Значение — ссылка, если по нему есть что сделать
 * (позвонить, написать, открыть карту).
 */
function Row({ label, value, href, external, index, still, placeholder }) {
  const [primary, ...rest] = lines(value);

  return (
    <Reveal
      hidden={still ? SHOWN : undefined}
      delay={still ? 0 : index * STEP}
      className="grid gap-1 border-b border-hairline-soft py-5 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-8"
    >
      <dt className="font-label-md text-label-md uppercase text-stencil">{label}</dt>

      <dd className="min-w-0">
        {primary ? (
          <>
            {href ? (
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="font-body-lg text-body-md text-ink underline decoration-hairline transition-colors hover:decoration-stencil"
              >
                {primary}
              </a>
            ) : (
              <span className="font-body-lg text-body-md text-ink">{primary}</span>
            )}

            {rest.map((line) => (
              <span key={line} className="mt-1 block font-body-md text-body-sm text-ink-dim">
                {line}
              </span>
            ))}
          </>
        ) : (
          <Placeholder label={placeholder} />
        )}
      </dd>
    </Reveal>
  );
}

/** Поле формы. Ошибка называется словами и связана с полем через aria. */
function Field({ id, label, value, fault, multiline, type = 'text', required, placeholder, onChange }) {
  const common = {
    id,
    name: id,
    value,
    onChange,
    placeholder,
    'aria-invalid': fault ? true : undefined,
    'aria-describedby': fault ? `${id}-error` : undefined,
    className: `w-full border bg-transparent px-4 py-3 font-body-md text-body-md text-ink outline-none transition-colors placeholder:text-ink-quiet focus:border-stencil ${
      fault ? 'border-ink-quiet' : 'border-hairline'
    }`,
  };

  return (
    <div>
      <label htmlFor={id} className="font-label-2xs text-label-2xs mb-2 block uppercase text-stencil">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      {multiline ? <textarea rows={5} {...common} /> : <input type={type} {...common} />}

      {fault && (
        <span id={`${id}-error`} className="font-body-sm text-body-sm mt-2 block text-ink">
          {fault}
        </span>
      )}
    </div>
  );
}

export default function Contacts() {
  const { lang, t } = useLang();
  const still = useReducedMotion();

  /** Появление при монтировании. Выключенное движение — сразу конечный кадр. */
  const enter = (delay) => (still ? {} : rise(delay));

  // lang в зависимостях: смена языка — это новый запрос за текстами.
  const { data: texts } = useApi((signal) => api.texts(lang, signal), [lang]);

  const [form, setForm] = useState(EMPTY);
  const [faults, setFaults] = useState({});
  const [state, setState] = useState('idle');
  const [failure, setFailure] = useState('');
  const [product, setProduct] = useState(null);

  const text = (key, fallback = '') => texts?.[key] ?? fallback;

  const address = text('contacts.address');
  const mapsLink = useMemo(
    () =>
      lines(address).length > 0
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lines(address).join(', '))}`
        : undefined,
    [address],
  );

  const [primaryEmail] = lines(text('contacts.email'));
  const [primaryPhone] = lines(text('contacts.phone'));

  // Со страницы позиции сюда приходят с ?product=slug: подставляем тему и
  // привязываем будущую заявку к позиции, чтобы в админке было видно, о чём она.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('product');
    if (!slug) return undefined;

    let cancelled = false;

    api
      .product(slug, lang)
      .then((data) => {
        if (cancelled) return;

        setProduct(data);
        // Тему подставляем только в пустое поле — иначе смена языка затёрла бы
        // набранный посетителем текст.
        setForm((previous) => ({
          ...previous,
          subject: previous.subject || t('contacts.subject_price', { name: data.name }),
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const update = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (state === 'sending') return;

    // Проверка общая с запросом КП. Телефона в этой форме нет, поэтому
    // обязательным контактом остаётся почта — это и проверит `faultsOf`.
    const found = faultsOf({ ...form, phone: '' }, t);
    setFaults(found);

    if (Object.keys(found).length > 0) return;

    setState('sending');
    setFailure('');

    try {
      await api.submitRequest({
        ...form,
        product_slug: product?.slug,
        path: window.location.pathname + window.location.search,
      });

      setForm(EMPTY);
      setState('sent');
    } catch (error) {
      setFailure(error.message || t('contacts.send_error'));
      setState('idle');
    }
  };

  const sending = state === 'sending';

  return (
    <main className="relative z-10 mx-auto max-w-container-max px-margin-mobile pb-stack-xl md:px-margin-desktop">
      <header className="relative mb-stack-xl">
        {/* Клеймо по левому борту: маркировка ящика, а не надзаголовок. */}
        <span
          aria-hidden="true"
          className="font-label-sm text-label-sm absolute top-1 hidden uppercase text-ink-quiet xl:block"
          style={{
            writingMode: 'vertical-rl',
            letterSpacing: '0.34em',
            left: 'calc(var(--spacing-rail) * -1)',
          }}
        >
          {t('contacts.rail')}
        </span>

        <motion.h1
          {...enter(0.05)}
          className="max-w-3xl font-display-lg text-headline-lg-mobile text-ink md:text-display-lg"
        >
          {text('contacts.title', t('contacts.title'))}
        </motion.h1>

        <motion.p {...enter(0.16)} className="mt-stack-sm max-w-[62ch] font-body-lg text-body-md text-ink-dim">
          {text('contacts.intro') || <Placeholder label={t('contacts.intro_placeholder')} />}
        </motion.p>
      </header>

      {/* Реквизиты: графа слева, значение справа. */}
      <section aria-labelledby="contacts-details" className="mb-stack-xl">
        <h2 id="contacts-details" className="kns-display text-headline-md text-ink">
          {t('contacts.details_title')}
        </h2>

        <dl className="mt-stack-md border-t border-hairline">
          <Row
            index={0}
            still={still}
            label={t('contacts.office')}
            value={address}
            href={mapsLink}
            external
            placeholder={t('contacts.address_placeholder')}
          />
          <Row
            index={1}
            still={still}
            label={t('contacts.email_label')}
            value={text('contacts.email')}
            href={primaryEmail ? `mailto:${primaryEmail}` : undefined}
            placeholder={t('contacts.email_placeholder')}
          />
          <Row
            index={2}
            still={still}
            label={t('contacts.phone_label')}
            value={text('contacts.phone')}
            href={primaryPhone ? `tel:${primaryPhone.replace(/[^\d+]/g, '')}` : undefined}
            placeholder={t('contacts.phone_placeholder')}
          />
          <Row
            index={3}
            still={still}
            label={t('contacts.map_title')}
            value={text('contacts.map_text')}
            placeholder={t('contacts.map_placeholder')}
          />
        </dl>

        {mapsLink && (
          <div className="mt-stack-sm">
            <Button href={mapsLink} target="_blank" rel="noopener noreferrer" variant="ghost" iconEnd="map">
              {t('contacts.open_map')}
            </Button>
          </div>
        )}
      </section>

      {/* Форма: единственное акцентное действие страницы. */}
      <section aria-labelledby="contacts-form" className="border-t border-hairline pt-stack-lg">
        <h2 id="contacts-form" className="kns-display text-headline-md text-ink">
          {t('contacts.form_title')}
        </h2>

        {state === 'sent' ? (
          <div className="mt-stack-md flex max-w-[62ch] flex-col items-start gap-4 border border-hairline p-stack-md">
            <Icon name="check" size="xl" className="text-stencil" />
            <h3 className="kns-display text-headline-md text-ink">{t('contacts.success_title')}</h3>
            <p className="font-body-md text-body-md text-ink-dim">{t('contacts.success_text')}</p>
            <Button variant="ghost" onClick={() => setState('idle')}>
              {t('contacts.success_again')}
            </Button>
          </div>
        ) : (
          <>
            {product && (
              <p className="mt-stack-sm font-label-2xs text-label-2xs uppercase text-ink-dim">
                {t('contacts.product_request')} <span className="text-stencil">{product.name}</span>
              </p>
            )}

            <form onSubmit={submit} noValidate className="mt-stack-md grid max-w-[62ch] gap-stack-sm">
              <div className="grid gap-stack-sm sm:grid-cols-2">
                <Field
                  id="contact-name"
                  label={t('contacts.field_name')}
                  placeholder={t('contacts.field_name_placeholder')}
                  value={form.name}
                  fault={faults.name}
                  required
                  onChange={update('name')}
                />
                <Field
                  id="contact-email"
                  type="email"
                  label={t('contacts.field_email')}
                  placeholder={t('contacts.field_email_placeholder')}
                  value={form.email}
                  fault={faults.email}
                  required
                  onChange={update('email')}
                />
              </div>

              <Field
                id="contact-subject"
                label={t('contacts.field_subject')}
                placeholder={t('contacts.field_subject_placeholder')}
                value={form.subject}
                onChange={update('subject')}
              />

              <Field
                id="contact-message"
                label={t('contacts.field_message')}
                placeholder={t('contacts.field_message_placeholder')}
                value={form.message}
                multiline
                onChange={update('message')}
              />

              <div className="mt-stack-xs flex flex-wrap items-center gap-4">
                <Button type="submit" size="lg" disabled={sending}>
                  {sending ? t('contacts.submitting') : t('contacts.submit')}
                </Button>
                <span className="font-label-2xs text-label-2xs text-ink-quiet">
                  * {t('contacts.required_note')}
                </span>
              </div>
            </form>

            {/* Живая область стоит всегда: ответ, появившийся внутри неё,
                прочитывается вслух без переноса фокуса. */}
            <div role="status" aria-live="polite">
              {failure && (
                <p className="mt-stack-sm max-w-[58ch] font-body-md text-body-md text-ink">{failure}</p>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
