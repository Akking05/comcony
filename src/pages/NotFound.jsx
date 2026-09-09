import { motion, useReducedMotion } from 'motion/react';

import { useT } from '../lib/i18n.jsx';
import { rise } from '../lib/motion.js';
import { Button } from '../components/ui/index.js';

/**
 * Несуществующий адрес — в мире сайта, а не системный экран браузера.
 *
 * Раньше неизвестный путь молча отдавал главную с кодом 200: посетитель не
 * понимал, что ошибся, а поисковик индексировал опечатки как её копии.
 *
 * Форма — отбраковка на упаковочном листе: номер по борту набит трафаретом
 * и перечёркнут, ниже графа «позиция → не найдена» и два способа вернуться
 * в перечень. Акцент в кадре один и принадлежит каталогу: 404 — это не
 * конец маршрута, а промах мимо номенклатуры.
 */
export default function NotFound() {
  const t = useT();
  const still = useReducedMotion();

  return (
    <main className="relative z-10 mx-auto flex min-h-[62vh] max-w-container-max flex-col justify-center px-margin-mobile pb-stack-xl md:px-margin-desktop">
      <motion.div {...(still ? {} : rise())} className="w-full">
        {/* Номер набит по борту: сам знак, а не заголовок страницы. */}
        <div className="relative inline-block">
          <span
            aria-hidden="true"
            className="kns-display block text-[clamp(96px,22vw,220px)] leading-[0.78] text-stencil"
          >
            404
          </span>

          {/* Перечёркнуто одним проходом — отметка отбраковки. */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-px w-full origin-left -rotate-3 bg-stencil-dim"
          ></span>
        </div>

        <div aria-hidden="true" className="kns-dash mt-stack-md w-full max-w-3xl"></div>

        <dl className="mt-stack-md max-w-[62ch]">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <dt className="font-label-md text-label-md uppercase text-ink-quiet">{t('notfound.eyebrow')}</dt>
            <dd className="font-display-md text-headline-lg-mobile text-ink md:text-headline-lg">
              {t('notfound.title')}
            </dd>
          </div>
        </dl>

        <p className="mt-stack-md max-w-[58ch] font-body-lg text-body-md text-ink-dim">{t('notfound.text')}</p>

        <div className="mt-stack-lg flex flex-wrap items-center gap-4">
          <Button href="/products" size="lg">
            {t('common.catalog')}
          </Button>

          <Button href="/" variant="ghost" iconEnd="arrow_forward">
            {t('common.home')}
          </Button>
        </div>

        <p className="mt-stack-lg max-w-[58ch] font-body-md text-body-sm text-ink-dim">
          {t('notfound.help_before')}{' '}
          <a
            href="/contacts"
            className="text-stencil underline decoration-hairline transition-colors hover:decoration-stencil"
          >
            {t('notfound.help_link')}
          </a>{' '}
          {t('notfound.help_after')}
        </p>
      </motion.div>
    </main>
  );
}
