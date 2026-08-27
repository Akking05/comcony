/**
 * Общие пресеты анимаций. Один почерк на всех страницах:
 * появление снизу, мягкое замедление, срабатывание один раз.
 */
export const EASE = [0.23, 1, 0.32, 1];

/** Появление сразу при монтировании — для первого экрана. */
export const rise = (delay = 0, distance = 24) => ({
  initial: { opacity: 0, y: distance, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.8, delay, ease: EASE },
});

/** Появление при попадании в кадр — для всего, что ниже сгиба. */
export const riseOnScroll = (delay = 0, distance = 28) => ({
  initial: { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

/** Мягкое проявление без смещения — для крупных изображений. */
export const fadeOnScroll = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.98 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, delay, ease: EASE },
});

/**
 * Каскад для списков: родитель раздаёт задержку детям,
 * не приходится считать delay вручную для каждого элемента.
 */
export const stagger = (step = 0.08, delay = 0) => ({
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-80px' },
  variants: {
    hidden: {},
    visible: { transition: { staggerChildren: step, delayChildren: delay } },
  },
});

export const staggerItem = {
  variants: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  },
};
