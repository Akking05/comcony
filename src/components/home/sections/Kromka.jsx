import { Button } from '../../ui/index.js';
import { HANDLING_MARKS } from '../graphics.jsx';
import { lerp, stagger, useSectionMotion } from '../motion.js';
import { Placeholder } from '../parts.jsx';

/*
  Экран 8. Нижняя кромка ящика.

  Шва между страницей и подвалом нет: у кромки нет ни своего фона, ни рамки —
  земля просто разрежается. Движение ровно об этом: шаг маркировки
  расходится, краска становится реже, знаки обращения с грузом проступают
  по одному. Конечное состояние — самая редкая маркировка.

  Адрес назначения — настоящий, из контактов в базе. Пустой адрес не
  подменяется правдоподобным: на его месте стоит заглушка.
*/

export function Kromka({ t, destination, address, catalog }) {
  const { ref, t: progress } = useSectionMotion({ from: 0.02, to: 0.44, ease: false });
  const step = lerp(7, 26, progress);

  return (
    <section className="kns-kromka" ref={ref}>
      <div
        className="kns-kromka-thinning"
        aria-hidden="true"
        style={{ '--kns-thin': `${step.toFixed(2)}px`, opacity: lerp(0.35, 1, progress) }}
      />

      <div className="kns-kromka-row">
        <ul className="kns-kromka-marks" aria-label={t('home.handling')}>
          {HANDLING_MARKS.map(({ id, labelKey, Mark }, index) => {
            const shown = stagger(progress, index, HANDLING_MARKS.length, 0.5);

            return (
              <li className="kns-kromka-mark" key={id} style={{ opacity: 0.1 + 0.9 * shown }}>
                <svg viewBox="-40 -40 80 80" aria-hidden="true" focusable="false">
                  <Mark />
                </svg>
                <span className="kns-kromka-mark-label">{t(labelKey)}</span>
              </li>
            );
          })}
        </ul>

        <p className="kns-kromka-address">
          <span className="kns-kromka-key">{destination}</span>
          {address.length > 0 ? (
            address.map((line) => (
              <span className="kns-kromka-line" key={line}>
                {line}
              </span>
            ))
          ) : (
            <Placeholder label={t('home.address')} />
          )}
        </p>

        <Button href={catalog.href} variant="ghost" iconEnd="arrow_forward">
          {catalog.label}
        </Button>
      </div>
    </section>
  );
}
