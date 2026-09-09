import { DirectionGlyph } from '../graphics.jsx';
import { numeral, stagger, useSectionMotion } from '../motion.js';
import { Ghost, Placeholder, Rail } from '../parts.jsx';

/*
  Экран 3. Трафаретные клейма по борту.

  Это не решётка карточек: у клейма нет рамки, нет общего габарита и нет
  одинакового наклона. Клейма набиты прямо по борту — полосе, уходящей в
  правый край кадра, — и держатся только краской.

  Движение — печать по одному, с шагом: клейма проступают в порядке номеров
  позиции. Конечное состояние — все набиты; без движения стоит оно.

  Направления приходят из базы: это категории, у которых есть опубликованные
  позиции. Строки применения в базе пока нет, и на её месте стоит заглушка,
  а не выдуманное описание.
*/

/**
 * Как стоит каждое клеймо на борту: доля свободной ширины, наклон, посадка по
 * высоте и кегль знака. Единственное место, где эти числа названы.
 */
const STENCIL = [
  { span: 1.16, tilt: -1.1, drop: 0, glyph: 96 },
  { span: 0.92, tilt: 0.8, drop: 28, glyph: 74 },
  { span: 1.06, tilt: -0.5, drop: 10, glyph: 86 },
  { span: 0.86, tilt: 1.3, drop: 36, glyph: 68 },
];

export function Directions({ anchor, rail, ghost, title, items, placeholderLabel, emptyNote }) {
  const { ref, t } = useSectionMotion({ from: 0.06, to: 0.52 });

  return (
    <section className="kns-section" id={anchor} ref={ref}>
      <Rail>{rail}</Rail>
      <Ghost>{ghost}</Ghost>

      <h2 className="kns-heading">{title}</h2>

      {items.length === 0 && <p className="kns-lead mt-8">{emptyNote}</p>}

      {items.length > 0 && (
        <div className="kns-board">
          <ul className="kns-stamp-row">
            {items.map((item, index) => {
              const printed = stagger(t, index, items.length, 0.5);
              const stencil = STENCIL[index % STENCIL.length];

              return (
                <li
                  className="kns-stamp"
                  key={item.slug}
                  style={{
                    opacity: 0.06 + 0.94 * printed,
                    '--stamp-rise': `${((1 - printed) * 22).toFixed(2)}px`,
                    '--stamp-span': stencil.span,
                    '--stamp-tilt': `${stencil.tilt}deg`,
                    '--stamp-drop': `${stencil.drop}px`,
                    '--stamp-glyph': `${stencil.glyph}px`,
                  }}
                >
                  <span className="kns-stamp-number">{numeral(index)}</span>
                  <svg
                    className="kns-stamp-glyph"
                    viewBox="-46 -46 92 92"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <DirectionGlyph slug={item.slug} />
                  </svg>
                  <span className="kns-stamp-title">{item.title}</span>
                  <span className="kns-stamp-line">
                    {item.line ? item.line : <Placeholder label={placeholderLabel} />}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
