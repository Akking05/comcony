import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { EASE } from '../lib/motion.js';

const HIDDEN = { opacity: 0, y: 28 };
const SHOWN = { opacity: 1, y: 0 };
const VIEWPORT = { once: true, margin: '-80px' };

/**
 * Появление при попадании в кадр — устойчивое к перерисовкам.
 *
 * Раньше это делал whileInView, и он оказался хрупким: motion держит
 * состояние показа внутри наблюдателя пересечений, а тот пересоздаётся при
 * изменении своих настроек. Свежий наблюдатель стартует как «вне кадра»,
 * элемент откатывается в исходное состояние, и с once: true вернуть его
 * уже некому — на экране это выглядит как «текст появился и через секунду
 * пропал», ровно в момент ответа второго запроса к API.
 *
 * Здесь факт показа живёт в состоянии компонента: один раз показанное
 * не скрывается, что бы ни случилось с наблюдателем.
 */
export function Reveal({ as = 'div', delay = 0, duration = 0.7, className, children, ...rest }) {
  const ref = useRef(null);
  const inView = useInView(ref, VIEWPORT);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (inView) setShown(true);
  }, [inView]);

  const Component = motion[as] ?? motion.div;

  return (
    <Component
      ref={ref}
      initial={HIDDEN}
      animate={shown ? SHOWN : HIDDEN}
      transition={{ duration, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
}
