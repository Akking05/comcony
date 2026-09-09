import { NODE_COUNT, NodeShape } from '../graphics.jsx';
import { numeral, phase, useSectionMotion } from '../motion.js';
import { Ghost, Rail } from '../parts.jsx';

/*
  Экран 4. Асимметричный сплит 5/7: текст слева, разобранный узел справа —
  и узел уходит за правый край кадра, а не помещается в колонку.

  Движение в два такта: сначала слева направо прочерчивается несущая ось,
  затем содержимое поднимается на 24px. Конечное состояние — ось проведена,
  блок стоит на месте, узел собран по своей оси.
*/

/** Разобранный узел крепления: пять элементов, нанизанных на одну ось. */
function ExplodedNode({ t }) {
  return (
    <svg viewBox="0 0 560 400" aria-hidden="true" focusable="false">
      <path className="kns-leader" d="M16 200 H552" strokeDasharray="16 10" />
      {Array.from({ length: NODE_COUNT }, (unused, step) => {
        const x = 66 + step * 108;
        const shift = (1 - t) * (step - 2) * 30;

        return (
          <g key={step} transform={`translate(${(x + shift).toFixed(2)} 200)`}>
            <g className="kns-shelf">
              <NodeShape index={step} />
            </g>
            <path className="kns-leader" d="M0 -96 V-124" />
            <text className="kns-name" x={0} y={-132} fontSize={13} textAnchor="middle">
              {numeral(step)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Doing({ anchor, rail, ghost, title, paragraph, claims }) {
  const { ref, t } = useSectionMotion({ from: 0.06, to: 0.54 });
  const axis = phase(t, 0, 0.55);
  const rise = phase(t, 0.35, 1);
  const lifted = {
    transform: `translateY(${((1 - rise) * 24).toFixed(2)}px)`,
    opacity: 0.15 + 0.85 * rise,
  };

  return (
    <section className="kns-section" id={anchor} ref={ref}>
      <Rail>{rail}</Rail>
      <Ghost>{ghost}</Ghost>

      <div
        className="kns-axis"
        style={{ transform: `scaleX(${axis.toFixed(3)})` }}
        aria-hidden="true"
      />

      <div className="kns-split">
        <div className="kns-split-text" style={lifted}>
          <h2 className="kns-heading">{title}</h2>
          {paragraph ? <p className="kns-lead">{paragraph}</p> : null}

          <ul className="kns-claims">
            {claims.map((claim, index) => (
              <li className="kns-claim" key={claim}>
                <span className="kns-claim-index">{numeral(index)}</span>
                <span className="kns-claim-text">{claim}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="kns-node" style={lifted}>
          <ExplodedNode t={rise} />
        </div>
      </div>
    </section>
  );
}
