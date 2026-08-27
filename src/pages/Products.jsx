import { Header } from '../components/layout/Header.jsx';
import { MobileDrawer } from '../components/layout/MobileDrawer.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';

function ProductCard({ product }) {
  return (
    <div className="glass-card group flex flex-col p-2 reveal-element">
      <div className="overflow-hidden h-[320px] mb-4 bg-surface-container-high relative">
        {product.main_image ? (
          <img
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="card-image w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            src={product.main_image}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-outline/40">
            <span className="material-symbols-outlined text-6xl">image</span>
          </div>
        )}
        {product.badge && (
          <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur-md px-3 py-1 border border-white/10 rounded flex items-center gap-2">
            <div className="active-glow"></div>
            <span className="font-label-sm text-label-sm text-white">{product.badge}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <div className="px-4 pb-6 pt-2">
        <h3 className="font-headline-md text-headline-md mb-2 text-primary">
          {product.category || product.name}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">{product.short_description}</p>
        <a
          href={`/products/${product.slug}`}
          className="flex justify-between items-center border-t border-white/10 pt-4 cursor-pointer"
        >
          <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase">{product.name}</span>
          <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform duration-300">
            arrow_forward
          </span>
        </a>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass-card flex flex-col p-2">
      <div className="h-[320px] mb-4 bg-surface-container-high animate-pulse"></div>
      <div className="px-4 pb-6 pt-2 space-y-3">
        <div className="h-6 w-2/3 bg-white/5 animate-pulse rounded"></div>
        <div className="h-4 w-full bg-white/5 animate-pulse rounded"></div>
        <div className="h-px w-full bg-white/10 mt-6"></div>
      </div>
    </div>
  );
}

export default function Products() {
  const { data: products, loading, error } = useApi((signal) => api.products(signal));

  return (
    <>
      <div className="fixed inset-0 technical-grid z-0 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-surface/50 to-background z-0 pointer-events-none"></div>
      <Header active="/products" />
      <MobileDrawer active="/products" />

      <main className="relative z-10 pt-[120px] pb-stack-xl max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <header className="mb-stack-lg md:mb-stack-xl relative reveal-element">
          <div className="absolute top-0 right-0 hidden lg:flex flex-col items-end gap-2 p-4 border border-white/10 bg-surface/30 backdrop-blur-md rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-outline uppercase tracking-tighter">Core Status</span>
                <span className="text-label-sm text-primary font-bold">OPERATIONAL</span>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center relative">
                <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
                <span className="material-symbols-outlined text-primary text-sm">memory</span>
              </div>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-3/4 animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-stack-sm">
            <div className="active-glow"></div>
            <span className="font-label-md text-label-md text-primary tracking-[0.2em] uppercase px-3 py-1 border border-primary/30 rounded-full bg-primary/5">
              Enterprise Portfolio
            </span>
          </div>
          <div className="font-label-sm text-label-sm text-outline/60 mb-2 tracking-widest">SYSTEM ID: KAE-PRD-024</div>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg mb-4 max-w-3xl">Наша продукция</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Технологии, созданные для сложных задач. Мы проектируем будущее через призму инженерного совершенства и
            абсолютной надежности.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {loading && Array.from({ length: 6 }, (_, index) => <CardSkeleton key={index} />)}

          {!loading && products?.map((product) => <ProductCard key={product.slug} product={product} />)}
        </section>

        {error && (
          <div className="glass-card p-8 text-center border border-primary/20">
            <span className="material-symbols-outlined text-primary/60 text-4xl mb-3">cloud_off</span>
            <p className="font-body-md text-on-surface-variant">
              Не удалось загрузить каталог. Обновите страницу или попробуйте позже.
            </p>
          </div>
        )}

        {!loading && !error && products?.length === 0 && (
          <div className="glass-card p-8 text-center border border-white/10">
            <p className="font-body-md text-on-surface-variant">Каталог пока пуст.</p>
          </div>
        )}

        <section className="mt-stack-xl flex flex-col items-center text-center reveal-element">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-[120px] font-black text-outline/10 tracking-tighter select-none mb-stack-lg leading-none">
            READY FOR TOMORROW
          </h2>
          <div className="glass-card max-w-3xl w-full p-stack-lg border border-primary/20 bg-primary/5">
            <h3 className="font-headline-lg text-headline-md md:text-headline-lg mb-6">
              Готовы к реализации вашего проекта?
            </h3>
            <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant mb-8 px-4">
              Свяжитесь с нашими инженерами для обсуждения спецификаций и возможностей масштабирования.
            </p>
            <a
              href="/contacts"
              className="inline-block bg-primary-container text-on-primary-container font-headline-md px-12 py-5 rounded-lg glow-button text-headline-md w-full md:w-auto"
            >
              Оставить заявку
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
