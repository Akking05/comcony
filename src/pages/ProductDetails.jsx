import { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { MobileDrawer } from '../components/layout/MobileDrawer.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { useApi } from '../hooks/useApi.js';
import { api, track } from '../lib/api.js';

const formatSize = (bytes) => {
  if (!bytes) return '';

  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${Math.max(1, Math.round(bytes / 1024))} КБ`;
};

function Shell({ children }) {
  return (
    <>
      <div className="fixed inset-0 tech-grid pointer-events-none z-0"></div>
      <div className="scanline pointer-events-none z-1"></div>
      <Header active="/products" />
      <MobileDrawer active="/products" />

      <main className="pt-[120px] pb-stack-xl max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 min-h-[60vh]">
        <a
          href="/products"
          className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-8 group"
        >
          <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-label-md text-label-md uppercase tracking-widest">Назад к каталогу</span>
        </a>

        {children}
      </main>

      <Footer />
    </>
  );
}

export default function ProductDetails({ slug }) {
  const { data: product, loading, error } = useApi((signal) => api.product(slug, signal), [slug]);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    if (!product) return;

    document.title = `${product.name} | KAE Engineering`;
    track({ type: 'product_view', path: window.location.pathname, product_slug: product.slug });
    setActiveImage(product.main_image || product.gallery[0]?.path || null);
  }, [product]);

  if (loading) {
    return (
      <Shell>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="glass-card p-2 rounded-lg">
            <div className="aspect-[4/3] w-full bg-surface-container-high animate-pulse rounded"></div>
          </div>
          <div className="space-y-6 pt-4">
            <div className="h-6 w-48 bg-white/5 animate-pulse rounded-full"></div>
            <div className="h-12 w-2/3 bg-white/5 animate-pulse rounded"></div>
            <div className="h-24 w-full bg-white/5 animate-pulse rounded"></div>
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !product) {
    const notFound = error?.status === 404;

    return (
      <Shell>
        <div className="glass-card p-12 text-center border border-primary/20 max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-primary/50 text-6xl mb-4">
            {notFound ? 'search_off' : 'cloud_off'}
          </span>
          <h1 className="font-headline-lg text-headline-md text-white mb-4">
            {notFound ? 'Товар не найден' : 'Не удалось загрузить товар'}
          </h1>
          <p className="font-body-md text-on-surface-variant mb-8">
            {notFound
              ? 'Возможно, он снят с публикации или адрес изменился.'
              : 'Проверьте соединение и обновите страницу.'}
          </p>
          <a
            href="/products"
            className="inline-block bg-primary-container text-on-primary-container px-8 py-4 rounded-sm font-label-md text-label-md font-bold uppercase tracking-widest primary-glow"
          >
            Вернуться в каталог
          </a>
        </div>
      </Shell>
    );
  }

  const thumbnails = [
    ...(product.main_image ? [{ path: product.main_image, alt: product.name }] : []),
    ...product.gallery,
  ];

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        {/* Изображение и галерея */}
        <div className="reveal-element">
          <div className="glass-card p-2 rounded-lg">
            <div className="aspect-[4/3] w-full overflow-hidden rounded relative bg-surface-container-high">
              {activeImage ? (
                <img alt={product.name} className="w-full h-full object-cover" src={activeImage} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-outline/40">
                  <span className="material-symbols-outlined text-6xl">image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

          {thumbnails.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {thumbnails.map((image) => (
                <button
                  key={image.path}
                  type="button"
                  onClick={() => setActiveImage(image.path)}
                  className={`h-20 w-20 overflow-hidden rounded border transition-all ${
                    activeImage === image.path
                      ? 'border-primary shadow-[0_0_16px_rgba(0,209,255,0.25)]'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={image.path} alt={image.alt || product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="flex flex-col justify-center h-full reveal-element stagger-1">
          {product.category && (
            <div className="flex items-center gap-3 mb-6">
              <div className="active-glow"></div>
              <span className="font-label-md text-label-md text-primary tracking-[0.2em] uppercase px-3 py-1 border border-primary/30 rounded-full bg-primary/5">
                {product.category}
              </span>
            </div>
          )}

          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-white mb-6">{product.name}</h1>

          <div className="w-16 h-px bg-primary/50 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary animate-pulse"></div>
          </div>

          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 leading-relaxed whitespace-pre-line">
            {product.full_description || product.short_description}
          </p>

          {product.key_specs.length > 0 && (
            <div className="grid grid-cols-2 gap-6 mb-12">
              {product.key_specs.map((spec) => (
                <div key={spec.name} className="border-l border-white/10 pl-4">
                  <div className="text-[10px] text-outline tracking-widest uppercase mb-1">{spec.name}</div>
                  <div className="font-label-md text-white">{spec.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <a
              href={`/contacts?product=${encodeURIComponent(product.slug)}`}
              className="bg-primary-container text-on-primary-container px-8 py-4 rounded-sm font-label-md text-label-md font-bold uppercase tracking-widest hover:scale-95 transition-transform duration-200 primary-glow"
            >
              Запросить цену
            </a>
            {product.documents.length > 0 && (
              <a
                href="#documentation"
                className="glass-panel text-white px-8 py-4 rounded-sm font-label-md text-label-md font-bold uppercase tracking-widest border border-outline hover:bg-white/5 transition-all"
              >
                Документация
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Технические характеристики */}
      {product.spec_groups.length > 0 && (
        <section className="mt-stack-xl reveal-element">
          <h2 className="font-headline-lg text-headline-md md:text-headline-lg text-white mb-8 uppercase tracking-tight">
            Технические характеристики
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            {product.spec_groups.map((group) => (
              <div key={group.title || 'general'} className="glass-panel p-6 md:p-8">
                {group.title && (
                  <div className="font-label-sm text-[10px] text-primary uppercase tracking-[0.25em] mb-5">
                    {group.title}
                  </div>
                )}
                <dl className="space-y-0">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-white/5 py-3 last:border-0"
                    >
                      <dt className="font-body-md text-body-md text-on-surface-variant">{item.name}</dt>
                      <dd className="font-label-md text-white text-right">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Области применения */}
      {product.applications.length > 0 && (
        <section className="mt-stack-xl reveal-element">
          <h2 className="font-headline-lg text-headline-md md:text-headline-lg text-white mb-8 uppercase tracking-tight">
            Области применения
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {product.applications.map((application) => (
              <div key={application.title} className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="active-glow"></div>
                  <h3 className="font-headline-md text-[18px] text-white">{application.title}</h3>
                </div>
                {application.description && (
                  <p className="font-body-md text-on-surface-variant">{application.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Документация */}
      {product.documents.length > 0 && (
        <section id="documentation" className="mt-stack-xl scroll-mt-32 reveal-element">
          <h2 className="font-headline-lg text-headline-md md:text-headline-lg text-white mb-8 uppercase tracking-tight">
            Документация
          </h2>
          <div className="flex flex-col gap-3">
            {product.documents.map((document) => (
              <a
                key={document.file_path}
                href={document.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel group flex items-center justify-between gap-4 p-5 transition-all hover:border-primary/40"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="material-symbols-outlined text-primary text-3xl shrink-0">picture_as_pdf</span>
                  <div className="min-w-0">
                    <div className="font-label-md text-white truncate">{document.title}</div>
                    <div className="font-label-sm text-[11px] text-outline uppercase tracking-widest">
                      PDF {formatSize(document.file_size)}
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:translate-y-0.5 transition-transform shrink-0">
                  download
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}
