import { motion } from 'motion/react';
import { rise } from '../lib/motion.js';

/**
 * Страница для несуществующих адресов.
 *
 * Раньше неизвестный путь молча отдавал главную с кодом 200 — посетитель
 * не понимал, что ошибся, а поисковик индексировал опечатки как её копии.
 */
export default function NotFound() {
  return (
    <main className="pt-24 md:pt-[120px] pb-stack-xl max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 min-h-[60vh] flex items-center">
      <motion.div {...rise()} className="w-full max-w-2xl">
        <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary">
          Error 404
        </span>

        <h1 className="mt-4 font-display-md text-headline-lg-mobile md:text-display-md text-white">
          Страница не найдена
        </h1>

        <p className="mt-6 font-body-lg text-body-lg text-on-surface-variant">
          Такого адреса на сайте нет. Возможно, страницу перенесли или в ссылке опечатка.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-button-text text-label-lg text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-xl">grid_view</span>
            Каталог продукции
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-6 py-3 font-button-text text-label-lg text-on-surface transition-colors hover:border-primary hover:text-primary"
          >
            <span className="material-symbols-outlined text-xl">home</span>
            На главную
          </a>
        </div>

        <div className="mt-12 border-t border-outline-variant pt-6">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Не нашли нужное?{' '}
            <a href="/contacts" className="text-primary transition-opacity hover:opacity-80">
              Напишите нам
            </a>{' '}
            — подскажем.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
