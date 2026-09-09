import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

/*
  Грамматика движения главной.

  Одно правило на все восемь экранов: `t` — доля пройденного пути секции,
  где 1 — конечное состояние. Пока сцена не измерена и при
  `prefers-reduced-motion` `t` равно единице сразу, поэтому страница
  отрисована разложенной, а движение только добавляется сверху. Пустых мест
  без JS не бывает по устройству, а не по недосмотру.

  Прогресс считается от положения секции в кадре, а не от общей прокрутки
  документа: секция знает только свой путь, и восемь секций не мешают друг
  другу. Замер идёт один раз на кадр — чтение геометрии и запись состояния
  разведены по разным фазам, поэтому браузер не пересчитывает раскладку
  посреди прокрутки.
*/

export function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

/** Отрезок общего прогресса, на котором происходит этот шаг. */
export function phase(progress, from, to) {
  if (to <= from) return progress >= to ? 1 : 0;
  return clamp01((progress - from) / (to - from));
}

/** Экспоненциальный выход: быстро стартует, долго доводит. */
export function easeOut(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -9 * t);
}

/** Шаг i из count внутри общего пути: элементы вступают по очереди, а не разом. */
export function stagger(t, index, count, overlap = 0.55) {
  const span = 1 / (count - overlap * (count - 1) || 1);
  const start = index * span * (1 - overlap);
  return clamp01((t - start) / span);
}

export function lerp(from, to, t) {
  return from + (to - from) * t;
}

/** Номер позиции в упаковочном листе: 01, 02, 03. */
export const numeral = (index) => String(index + 1).padStart(2, '0');

/**
 * Доля пути секции через кадр: 0 — верх секции на нижней кромке экрана,
 * 1 — низ секции ушёл за верхнюю.
 */
function readProgress(node) {
  const rect = node.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const travel = viewport + rect.height;

  if (travel <= 0) return 1;

  return clamp01((viewport - rect.top) / travel);
}

/**
 * Прогресс секции по скроллу.
 *
 * @param {object}  [options]
 * @param {number}  [options.from]  доля пути, на которой движение начинается
 * @param {number}  [options.to]    доля пути, на которой оно закончено
 * @param {boolean} [options.ease]  сгладить экспонентой; сцены, которые ведут
 *                                  пальцем, идут без сглаживания
 * @returns {{ ref: object, t: number, reduced: boolean }}
 */
export function useSectionMotion({ from = 0.14, to = 0.52, ease = true } = {}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (reduced) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    let frame = 0;
    let last = -1;

    const sample = () => {
      frame = 0;
      const next = readProgress(node);

      // Перерисовка ради изменения в тысячную долю не видна, а стоит целого
      // прохода по дереву секции — а у первого экрана это шесть деталей,
      // шесть выносок и крышка.
      if (Math.abs(next - last) < 0.001) return;

      last = next;
      setProgress(next);
    };

    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [reduced]);

  if (reduced) return { ref, t: 1, reduced: true };

  const raw = phase(progress, from, to);

  return { ref, t: ease ? easeOut(raw) : raw, reduced: false };
}

/* ------------------------------------------------------------------ */
/* Выбор сцены: широкая или узкая                                       */
/* ------------------------------------------------------------------ */

/** Рубеж, на котором мир меняет широкую сцену на узкую. Тот же, что в CSS. */
export const WIDE_QUERY = '(min-width: 900px)';

/**
 * Какая из двух сцен сейчас на экране.
 *
 * Считать шесть трансформов и выносок на каждом кадре для сцены, которую
 * скрыл CSS, некому и незачем — поэтому в дереве держится ровно одна.
 * До первого замера берётся широкая: на телефоне она сменится в том же
 * кадре, до первой отрисовки движения.
 */
export function useWideStage() {
  const [wide, setWide] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(WIDE_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(WIDE_QUERY);
    const apply = () => setWide(query.matches);

    apply();
    query.addEventListener('change', apply);

    return () => query.removeEventListener('change', apply);
  }, []);

  return wide;
}
