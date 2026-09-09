import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

import { useT } from '../lib/i18n.jsx';
import { Reveal, STEP } from './Reveal.jsx';
import { Button, Container, Icon } from './ui/index.js';

/**
 * Витрина продукции на главной — три позиции каталога, снятые с той же
 * полки: снимок, направление, название.
 *
 * Плитка собрана теми же токенами, что и ячейка каталога: ноль скруглений,
 * хайрлайн вместо рамки, направление трафаретом, а не акцентом. Единственный
 * акцент кадра остаётся у целевого действия секции, а не у трёх стрелок
 * подряд.
 *
 * Позиция без снимка получает видимую заглушку: чужая картинка на её месте
 * была бы подменой позиции.
 */

/** Насколько колонка уплывает за прокрутку. Разные знаки — колонки расходятся. */
const DRIFT = [28, -28, 14];

function ProductTile({ product, index, still }) {
  const ref = useRef(null);

  // Замеряем обёртку, а не саму плитку: у плитки меняется transform,
  // и мерить её же положение значило бы кормить параллакс своим результатом.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const drift = still ? 0 : (DRIFT[index] ?? 0);
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);

  return (
    <div ref={ref}>
      <Reveal delay={index * STEP}>
        <motion.a
          style={{ y }}
          href={`/products/${product.slug}`}
          className="group relative block border border-hairline-soft outline-none transition-colors hover:border-hairline hover:bg-stencil/6 focus-visible:border-hairline"
        >
          <div className="aspect-4/3 overflow-hidden bg-part-fill">
            {product.main_image ? (
              <img
                src={product.main_image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Icon name="image" size="3xl" className="text-stencil-dim" />
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 p-5">
            <div className="min-w-0">
              {product.category && (
                <div className="font-label-2xs text-label-2xs mb-1.5 truncate uppercase text-stencil">
                  {product.category}
                </div>
              )}
              <div className="font-title-md text-title-md text-ink">{product.name}</div>
            </div>

            <Icon
              name="arrow_forward"
              className="mb-1 shrink-0 text-ink-quiet transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </motion.a>
      </Reveal>
    </div>
  );
}

export function ProductShowcase({ products }) {
  const t = useT();
  const still = useReducedMotion();

  // Показываем в первую очередь товары с собственным снимком (/uploads/):
  // у демонстрационных записей прежней сборки в main_image стояли внешние
  // ссылки. Публичный API их больше не отдаёт, но порядок остаётся верным
  // и для позиции, снимок которой ещё не приложили.
  const all = products ?? [];
  const own = all.filter((product) => product.main_image?.startsWith('/uploads/'));
  const external = all.filter((product) => product.main_image && !product.main_image.startsWith('/uploads/'));
  const noImage = all.filter((product) => !product.main_image);
  const tiles = [...own, ...external, ...noImage].slice(0, 3);

  if (!tiles.length) return null;

  return (
    <section className="relative z-10 py-stack-lg md:py-stack-xl">
      <Container>
        <Reveal className="mb-stack-lg flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl font-headline-lg text-headline-lg-mobile text-ink md:text-headline-lg">
            {t('showcase.title')}
          </h2>

          <Button href="/products" variant="outline" iconEnd="arrow_forward" className="shrink-0">
            {t('showcase.all')}
          </Button>
        </Reveal>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {tiles.map((product, index) => (
            <ProductTile key={product.slug} product={product} index={index} still={still} />
          ))}
        </div>
      </Container>
    </section>
  );
}
