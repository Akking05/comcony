/**
 * Общие пресеты анимаций. Один почерк на всех страницах:
 * появление снизу, мягкое замедление, срабатывание один раз.
 *
 * Все пресеты кешируются по своим аргументам и возвращают ОДИН И ТОТ ЖЕ
 * объект при повторных вызовах. Это не микрооптимизация, а условие
 * корректности: motion передаёт viewport в наблюдатель пересечений, и новая
 * ссылка на каждом рендере пересоздаёт его. Свежий наблюдатель стартует как
 * «вне кадра», элемент откатывается в initial, а вернуть его уже некому —
 * whileInView с once: true отработал. Внешне это выглядит так, будто текст
 * появился и через долю секунды исчез: ровно в тот момент, когда пришёл
 * второй ответ от API и вызвал повторный рендер.
 */
export const EASE = [0.23, 1, 0.32, 1];

/** Возвращает мемоизированный по аргументам вариант пресета. */
function cached(build) {
  const store = new Map();

  return (...args) => {
    const key = args.join('|');

    if (!store.has(key)) store.set(key, Object.freeze(build(...args)));

    return store.get(key);
  };
}

/** Появление сразу при монтировании — для первого экрана. */
export const rise = cached((delay = 0, distance = 24) => ({
  initial: { opacity: 0, y: distance, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.8, delay, ease: EASE },
}));

/** Появление при попадании в кадр — для всего, что ниже сгиба. */
export const riseOnScroll = cached((delay = 0, distance = 28) => ({
  initial: { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay, ease: EASE },
}));

/** Мягкое проявление без смещения — для крупных изображений. */
export const fadeOnScroll = cached((delay = 0) => ({
  initial: { opacity: 0, scale: 0.98 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, delay, ease: EASE },
}));

/**
 * Элемент списка, который анимируется самостоятельно.
 *
 * Оркестрацию staggerChildren не используем: там ребёнок берёт состояние от
 * родителя, и если родитель успел отыграть до появления ребёнка (данные
 * пришли из API позже), ребёнок навсегда остаётся невидимым.
 */
export const riseItem = cached((index = 0, step = 0.07) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay: index * step, ease: EASE },
}));

/**
 * Заполнение полосы до указанной ширины при попадании в кадр.
 * Кешируется по паре (ширина, задержка) — по той же причине, что и остальные.
 */
export const fillBar = cached((width, delay = 0) => ({
  initial: { width: 0 },
  whileInView: { width },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 1.1, delay, ease: EASE },
}));
