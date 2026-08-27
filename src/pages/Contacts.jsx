import { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { MobileDrawer } from '../components/layout/MobileDrawer.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };

function InfoCard({ icon, title, value }) {
  return (
    <div className="glass-panel p-8 relative overflow-hidden group hover:border-primary/50 transition-colors">
      <div className="absolute -inset-4 bg-primary/10 blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
      <div className="flex items-start gap-4 relative z-10">
        <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
        <div>
          <h3 className="font-headline-sm text-white mb-2">{title}</h3>
          <p className="text-on-surface-variant font-body-md whitespace-pre-line">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Contacts() {
  const { data: texts } = useApi((signal) => api.texts(signal));

  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [product, setProduct] = useState(null);

  const text = (key, fallback = '') => texts?.[key] ?? fallback;

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
        setForm((previous) => ({
          ...previous,
          subject: previous.subject || `Запрос цены: ${data.name}`,
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const update = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
  };

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
      setStatus({ state: 'success', message: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.' });
    } catch (error) {
      setStatus({ state: 'error', message: error.message || 'Не удалось отправить заявку.' });
    }
  };

  const sending = status.state === 'sending';

  return (
    <>
      <div className="fixed inset-0 tech-grid pointer-events-none z-0"></div>
      <div className="scanline pointer-events-none z-1"></div>
      <Header active="/contacts" />
      <MobileDrawer active="/contacts" />

      <main className="pt-32 pb-stack-xl min-h-screen relative z-10 flex flex-col justify-center">
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
          <div className="mb-12 text-center md:text-left reveal">
            <h1 className="font-headline-lg-mobile md:font-display-lg md:text-display-lg text-white leading-tight mb-4">
              <span className="text-primary">{text('contacts.title', 'Контакты')}</span>
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl">{text('contacts.intro')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Контактные данные */}
            <div className="lg:col-span-5 space-y-6">
              <InfoCard icon="location_on" title="Главный офис" value={text('contacts.address')} />
              <InfoCard icon="mail" title="Email" value={text('contacts.email')} />
              <InfoCard icon="phone" title="Телефон" value={text('contacts.phone')} />
            </div>

            {/* Форма */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-8 md:p-10 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                <h2 className="font-headline-md text-white mb-8 relative z-10">Напишите нам</h2>

                {product && (
                  <div className="relative z-10 mb-6 flex items-center gap-3 rounded-sm border border-primary/30 bg-primary/5 px-4 py-3">
                    <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Заявка по товару: <span className="text-primary">{product.name}</span>
                    </span>
                  </div>
                )}

                <form className="space-y-6 relative z-10" onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
                        Имя
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={form.name}
                        onChange={update('name')}
                        className="w-full bg-surface/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20"
                        placeholder="Иван Иванов"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={update('email')}
                        className="w-full bg-surface/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20"
                        placeholder="ivan@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
                      Тема
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={update('subject')}
                      className="w-full bg-surface/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20"
                      placeholder="Вопрос о сотрудничестве"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
                      Сообщение
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={form.message}
                      onChange={update('message')}
                      className="w-full bg-surface/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-white/20"
                      placeholder="Опишите вашу задачу..."
                    ></textarea>
                  </div>

                  {status.message && (
                    <div
                      role="status"
                      aria-live="polite"
                      className={`flex items-start gap-3 rounded-sm border px-4 py-3 ${
                        status.state === 'success'
                          ? 'border-primary/40 bg-primary/5 text-primary'
                          : 'border-red-400/40 bg-red-400/5 text-red-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {status.state === 'success' ? 'check_circle' : 'error'}
                      </span>
                      <span className="font-body-md text-body-md">{status.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto bg-primary-container text-on-primary-container px-10 py-4 rounded-sm font-label-md font-bold uppercase tracking-widest primary-glow transition-all hover:scale-95 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Отправляем…' : 'Отправить сообщение'}
                    <span className="material-symbols-outlined text-sm">{sending ? 'progress_activity' : 'send'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {text('contacts.map_text') && (
            <div className="mt-12 glass-panel p-8 relative overflow-hidden group text-center">
              <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
              <div className="relative z-10 space-y-4">
                <span className="material-symbols-outlined text-primary/40 text-5xl mb-2">map</span>
                <h3 className="font-headline-sm text-white">{text('contacts.map_title')}</h3>
                <p className="text-on-surface-variant font-body-md max-w-3xl mx-auto">{text('contacts.map_text')}</p>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
