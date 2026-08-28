import { motion } from 'motion/react';
import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';
import { rise, riseItem, riseOnScroll } from '../lib/motion.js';

function ProductCard({ product, index }) {
  return (
    <motion.div
      {...riseItem(index)}
      className="glass-card group flex flex-col p-2 transition-colors hover:border-primary/30"
    >
      <div className="relative mb-4 h-[320px] overflow-hidden bg-surface-container-high">
        {product.main_image ? (
          <img
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="card-image h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
            src={product.main_image}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-outline/40">
            <span className="material-symbols-outlined text-6xl">image</span>
          </div>
        )}

        {product.badge && (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded border border-white/10 bg-surface/80 px-3 py-1 backdrop-blur-md">
            <div className="active-glow"></div>
            <span className="font-label-sm text-label-sm text-white">{product.badge}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
      </div>

      <div className="px-4 pb-6 pt-2">
        <h3 className="mb-2 font-headline-md text-headline-md text-primary">{product.category || product.name}</h3>
        <p className="mb-6 font-body-md text-body-md text-on-surface-variant">{product.short_description}</p>

        <a
          href={`/products/${product.slug}`}
          className="flex cursor-pointer items-center justify-between border-t border-white/10 pt-4"
        >
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline">{product.name}</span>
          <span className="material-symbols-outlined text-primary transition-transform duration-300 group-hover:translate-x-2">
            arrow_forward
          </span>
        </a>
      </div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass-card flex flex-col p-2">
      <div className="mb-4 h-[320px] animate-pulse bg-surface-container-high"></div>
      <div className="space-y-3 px-4 pb-6 pt-2">
        <div className="h-6 w-2/3 animate-pulse rounded bg-white/5"></div>
        <div className="h-4 w-full animate-pulse rounded bg-white/5"></div>
        <div className="mt-6 h-px w-full bg-white/10"></div>
      </div>
    </div>
  );
}

export default function Products() {
  const { data: products, loading, error } = useApi((signal) => api.products(signal));

  return (
    <main className="relative z-10 mx-auto max-w-container-max px-margin-mobile pb-stack-xl pt-24 md:px-margin-desktop md:pt-[120px]">
      <header className="relative mb-stack-lg md:mb-stack-xl">
        <motion.div
          {...rise(0.5)}
          className="absolute right-0 top-0 hidden flex-col items-end gap-2 rounded-lg border border-white/10 bg-surface/30 p-4 backdrop-blur-md lg:flex"
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-tighter text-outline">Core Status</span>
              <span className="text-label-sm font-bold text-primary">OPERATIONAL</span>
            </div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/20">
              <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-primary"></div>
              <span className="material-symbols-outlined text-sm text-primary">memory</span>
            </div>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-3/4 animate-pulse bg-primary"></div>
          </div>
        </motion.div>

        <motion.div {...rise(0.05)} className="mb-stack-sm flex items-center gap-3">
          <div className="active-glow"></div>
          <span className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-label-md text-label-md uppercase tracking-[0.2em] text-primary">
            Enterprise Portfolio
          </span>
        </motion.div>

        <motion.div {...rise(0.12)} className="mb-2 font-label-sm text-label-sm tracking-widest text-outline/60">
          SYSTEM ID: KAE-PRD-024
        </motion.div>

        <motion.h1 {...rise(0.2)} className="mb-4 max-w-3xl font-display-lg text-headline-lg-mobile md:text-display-lg">
          Наша продукция
        </motion.h1>

        <motion.p {...rise(0.3)} className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
          Технологии, созданные для сложных задач. Мы проектируем будущее через призму инженерного совершенства и
          абсолютной надежности.
        </motion.p>
      </header>

      {loading && (
        <section className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </section>
      )}

      {!loading && products?.length > 0 && (
        <section className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} index={index} />
          ))}
        </section>
      )}

      {error && (
        <div className="glass-card border border-primary/20 p-8 text-center">
          <span className="material-symbols-outlined mb-3 text-4xl text-primary/60">cloud_off</span>
          <p className="font-body-md text-on-surface-variant">
            Не удалось загрузить каталог. Обновите страницу или попробуйте позже.
          </p>
        </div>
      )}

      {!loading && !error && products?.length === 0 && (
        <div className="glass-card border border-white/10 p-8 text-center">
          <p className="font-body-md text-on-surface-variant">Каталог пока пуст.</p>
        </div>
      )}

      <motion.section {...riseOnScroll()} className="mt-stack-xl flex flex-col items-center text-center">
        <h2 className="mb-stack-lg select-none font-display-lg text-headline-lg-mobile font-black leading-none tracking-tighter text-outline/10 md:text-[120px]">
          READY FOR TOMORROW
        </h2>

        <div className="glass-card w-full max-w-3xl border border-primary/20 bg-primary/5 p-stack-lg">
          <h3 className="mb-6 font-headline-lg text-headline-md md:text-headline-lg">
            Готовы к реализации вашего проекта?
          </h3>
          <p className="mb-8 px-4 font-body-lg text-body-md text-on-surface-variant md:text-body-lg">
            Свяжитесь с нашими инженерами для обсуждения спецификаций и возможностей масштабирования.
          </p>
          <a
            href="/contacts"
            className="glow-button inline-block w-full rounded-lg bg-primary-container px-12 py-5 font-headline-md text-headline-md text-on-primary-container md:w-auto"
          >
            Оставить заявку
          </a>
        </div>
      </motion.section>
    </main>
  );
}
