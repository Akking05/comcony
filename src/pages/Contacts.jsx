import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';
import { rise } from '../lib/motion.js';
import { Reveal } from '../components/Reveal.jsx';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };

/** Координаты офиса — выводятся как технический титр, в духе остального сайта. */
const COORDS = '51.1694° N / 71.4491° E';

const lines = (value) => String(value ?? '').split('\n').map((line) => line.trim()).filter(Boolean);

/**
 * Канал связи в шапке страницы. Первая строка значения — действие
 * (позвонить, написать), остальные — уточнение под ней.
 */
function ChannelTile({ icon, label, value, href, index }) {
  const [primary, ...rest] = lines(value);

  const body = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <span className="material-symbols-outlined text-2xl text-primary">{icon}</span>
        <span className="font-label-sm text-[10px] uppercase tracking-[0.25em] text-outline">
          {String(index).padStart(2, '0')}
        </span>
      </div>

      <div className="font-label-sm text-[10px] uppercase tracking-[0.2em] text-outline">{label}</div>

      <div className="mt-1.5 font-headline-md text-[17px] leading-snug text-white transition-colors group-hover:text-primary">
        {primary || '—'}
      </div>

      {rest.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {rest.map((line) => (
            <div key={line} className="font-body-md text-[13px] text-on-surface-variant">
              {line}
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 h-px w-full bg-white/10">
        <div className="h-full w-0 bg-primary transition-all duration-500 group-hover:w-full"></div>
      </div>
    </>
  );

  // Тип элемента намеренно не зависит от данных: если менять <div> на <a>
  // после загрузки текстов, React размонтирует плитку и смонтирует заново,
  // а каскад с viewport.once к тому моменту уже отработал — плитка так и
  // осталась бы невидимой. Ссылка просто появляется на том же элементе.
  return (
    <Reveal
      as="a"
      delay={(index - 1) * 0.07}
      href={href}
      className="glass-panel group relative block overflow-hidden p-6 transition-colors hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60"
    >
      {body}
    </Reveal>
  );
}

function Success({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/10"></span>
        <span className="material-symbols-outlined relative text-3xl text-primary">check</span>
      </div>

      <h3 className="mb-3 font-headline-lg text-headline-md text-white">Заявка принята</h3>
      <p className="mb-8 max-w-sm font-body-md text-body-md text-on-surface-variant">
        Мы свяжемся с вами в течение рабочего дня. Если вопрос срочный — позвоните напрямую.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="font-label-md text-label-md uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
      >
        Отправить ещё одну
      </button>
    </div>
  );
}

export default function Contacts() {
  const { data: texts } = useApi((signal) => api.texts(signal));

  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [product, setProduct] = useState(null);

  const text = (key, fallback = '') => texts?.[key] ?? fallback;

  const address = text('contacts.address');
  const mapsLink = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lines(address).join(', '))}`,
    [address],
  );

  // Со страницы товара сюда приходят с ?product=slug — подставляем тему
  // и привязываем будущую заявку к этому товару.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('product');
    if (!slug) return;

    let cancelled = false;

    api
      .product(slug)
      .then((data) => {
        if (cancelled) return;

        setProduct(data);
        setForm((previous) => ({ ...previous, subject: previous.subject || `Запрос цены: ${data.name}` }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const update = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status.state === 'sending') return;

    setStatus({ state: 'sending', message: '' });

    try {
      await api.submitRequest({
        ...form,
        product_slug: product?.slug,
        path: window.location.pathname + window.location.search,
      });

      setForm(EMPTY_FORM);
      setStatus({ state: 'success', message: '' });
    } catch (error) {
      setStatus({ state: 'error', message: error.message || 'Не удалось отправить заявку.' });
    }
  };

  const sending = status.state === 'sending';
  const fieldClass =
    'w-full rounded-sm border border-white/10 bg-surface/50 px-4 py-3 font-body-md text-white outline-none transition-all placeholder:text-white/20 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60';
  const labelClass = 'mb-2 block font-label-sm text-[11px] uppercase tracking-[0.15em] text-on-surface-variant';

  const [phoneNumber] = lines(text('contacts.phone'));
  const [primaryEmail] = lines(text('contacts.email'));

  return (
    <>
      <main className="relative z-10 pt-24 pb-stack-xl md:pt-32">
        <div className="mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
          {/* Заголовок */}
          <motion.header {...rise(0.05)} className="relative mb-stack-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="active-glow"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-primary">
                Свяжитесь с нами
              </span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-white md:font-display-lg md:text-display-lg lg:col-span-7">
                {text('contacts.title', 'Контакты')}
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant lg:col-span-5">{text('contacts.intro')}</p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
              <span className="font-label-sm text-[10px] uppercase tracking-[0.3em] text-outline/70">{COORDS}</span>
            </div>
          </motion.header>

          {/* Каналы связи */}
          <section className="mb-stack-xl grid grid-cols-1 gap-gutter md:grid-cols-3">
            <ChannelTile index={1} icon="location_on" label="Главный офис" value={address} href={mapsLink} />
            <ChannelTile
              index={2}
              icon="mail"
              label="Электронная почта"
              value={text('contacts.email')}
              href={primaryEmail ? `mailto:${primaryEmail}` : undefined}
            />
            <ChannelTile
              index={3}
              icon="call"
              label="Телефон"
              value={text('contacts.phone')}
              href={phoneNumber ? `tel:${phoneNumber.replace(/[^\d+]/g, '')}` : undefined}
            />
          </section>

          {/* Форма и врезка */}
          <section className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <div className="glass-panel relative h-full overflow-hidden">
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]"></div>

                {status.state === 'success' ? (
                  <Success onReset={() => setStatus({ state: 'idle', message: '' })} />
                ) : (
                  <div className="relative p-8 md:p-10">
                    <div className="mb-8 flex items-baseline justify-between gap-4">
                      <h2 className="font-headline-lg text-headline-md text-white">Напишите нам</h2>
                      <span className="font-label-sm text-[10px] uppercase tracking-[0.2em] text-outline">
                        Ответ в течение дня
                      </span>
                    </div>

                    {product && (
                      <div className="mb-6 flex items-center gap-3 rounded-sm border border-primary/30 bg-primary/5 px-4 py-3">
                        <span className="material-symbols-outlined text-xl text-primary">inventory_2</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Заявка по товару: <span className="text-primary">{product.name}</span>
                        </span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label htmlFor="name" className={labelClass}>
                            Имя <span className="text-primary">*</span>
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            disabled={sending}
                            value={form.name}
                            onChange={update('name')}
                            className={fieldClass}
                            placeholder="Иван Иванов"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className={labelClass}>
                            Email <span className="text-primary">*</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            disabled={sending}
                            value={form.email}
                            onChange={update('email')}
                            className={fieldClass}
                            placeholder="ivan@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className={labelClass}>
                          Тема
                        </label>
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          disabled={sending}
                          value={form.subject}
                          onChange={update('subject')}
                          className={fieldClass}
                          placeholder="Вопрос о сотрудничестве"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className={labelClass}>
                          Сообщение
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows="5"
                          disabled={sending}
                          value={form.message}
                          onChange={update('message')}
                          className={`${fieldClass} resize-none`}
                          placeholder="Опишите вашу задачу..."
                        ></textarea>
                      </div>

                      {status.state === 'error' && (
                        <div
                          role="alert"
                          className="flex items-start gap-3 rounded-sm border border-red-400/40 bg-red-400/5 px-4 py-3 text-red-300"
                        >
                          <span className="material-symbols-outlined text-xl">error</span>
                          <span className="font-body-md text-body-md">{status.message}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                          type="submit"
                          disabled={sending}
                          className="primary-glow inline-flex items-center justify-center gap-2 rounded-sm bg-primary-container px-10 py-4 font-label-md font-bold uppercase tracking-widest text-on-primary-container transition-all hover:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        >
                          {sending ? 'Отправляем…' : 'Отправить'}
                          <span
                            className={`material-symbols-outlined text-sm ${sending ? 'animate-spin' : ''}`}
                          >
                            {sending ? 'progress_activity' : 'send'}
                          </span>
                        </button>

                        <span className="font-label-sm text-[11px] text-outline">
                          Поля со звёздочкой обязательны
                        </span>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </Reveal>

            {/* Врезка */}
            <Reveal as="aside" delay={0.12} className="flex flex-col gap-gutter lg:col-span-5">
              <div className="glass-panel p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-primary">schedule</span>
                  <h3 className="font-headline-md text-[16px] uppercase tracking-wide text-white">Режим работы</h3>
                </div>

                <dl className="space-y-3">
                  <div className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-3">
                    <dt className="font-body-md text-body-md text-on-surface-variant">Понедельник — пятница</dt>
                    <dd className="font-label-md text-white">09:00 — 18:00</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="font-body-md text-body-md text-on-surface-variant">Суббота, воскресенье</dt>
                    <dd className="font-label-md text-outline">Выходной</dd>
                  </div>
                </dl>
              </div>

              <div className="glass-panel relative flex-1 overflow-hidden p-8">
                <div className="bg-topo pointer-events-none absolute inset-0 opacity-60"></div>
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-[80px]"></div>

                <div className="relative">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl text-primary">map</span>
                    <h3 className="font-headline-md text-[16px] uppercase tracking-wide text-white">
                      {text('contacts.map_title', 'Как добраться')}
                    </h3>
                  </div>

                  <address className="not-italic">
                    {lines(address).map((line, index) => (
                      <div
                        key={line}
                        className={
                          index === 0 ? 'font-headline-md text-[17px] text-white' : 'font-body-md text-on-surface-variant'
                        }
                      >
                        {line}
                      </div>
                    ))}
                  </address>

                  {text('contacts.map_text') && (
                    <p className="mt-4 font-body-md text-body-md text-on-surface-variant">{text('contacts.map_text')}</p>
                  )}

                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-6 inline-flex items-center gap-2 font-label-md text-label-md uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
                  >
                    Открыть на карте
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </a>
                </div>
              </div>
            </Reveal>
          </section>
        </div>
      </main>
    </>
  );
}
