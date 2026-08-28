import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { EASE } from '../lib/motion.js';

/**
 * Появление при попадании в кадр.
 *
 * Раньше это делал whileInView, и он оказался нерабочим: motion хранит факт
 * показа внутри наблюдателя пересечений, а тот живёт не дольше своих настроек.
 * Стоило наблюдателю пересоздаться — он стартовал как «вне кадра», элемент
 * откатывался в исходное состояние, и с once: true вернуть его было уже
 * некому. На экране это выглядело как «блок появился и через секунду пропал»
 * либо, если не повезло со временем ответа API, он не появлялся вовсе:
 * карточки команды на «О компании» так и висели с opacity: 0 посреди экрана.
 *
 * Здесь факт показа живёт в состоянии React. Один раз показанное не скрывается
 * никогда — что бы ни случилось с наблюдателем и сколько бы перерисовок ни
 * пришло следом.
 */

/** Движение по умолчанию: подъём снизу с проявлением. */
export const RISE = {
  hidden: { opacity: 0, y: 28 },
  shown: { opacity: 1, y: 0 },
  duration: 0.7,
  margin: '-80px',
};

/** Мягкое проявление без смещения — для крупных изображений и панелей. */
export const FADE = {
  hidden: { opacity: 0, scale: 0.98 },
  shown: { opacity: 1, scale: 1 },
  duration: 0.9,
  margin: '-60px',
};

/** Полоса, заполняющаяся до указанной ширины. */
export const bar = (width) => ({
  hidden: { width: 0 },
  shown: { width },
  duration: 1.1,
  margin: '-40px',
});

/** Шаг каскада для списков: i-й элемент ждёт i * step секунд. */
export const STEP = 0.07;

/**
 * @param {object} props
 * @param {string} [props.as]       тег: 'div' (по умолчанию), 'section', 'li'…
 * @param {object} [props.hidden]   состояние до появления
 * @param {object} [props.shown]    состояние после
 * @param {number} [props.duration] длительность в секундах
 * @param {string} [props.margin]   отступ зоны срабатывания
 * @param {number} [props.delay]    задержка — ею и делается каскад
 */
export function Reveal({
  as = 'div',
  hidden = RISE.hidden,
  shown = RISE.shown,
  duration = RISE.duration,
  margin = RISE.margin,
  delay = 0,
  className,
  children,
  ...rest
}) {
  const ref = useRef(null);

  // useInView, в отличие от whileInView, принимает настройки по значению:
  // новый объект на каждой перерисовке наблюдатель не пересоздаёт.
  const inView = useInView(ref, { once: true, margin });
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);

  const Component = motion[as] ?? motion.div;

  return (
    <Component
      ref={ref}
      initial={hidden}
      animate={seen ? shown : hidden}
      transition={{ duration, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
