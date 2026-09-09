import { SupplyMark } from '../graphics.jsx';
import { numeral, phase, stagger, useSectionMotion, useWideStage } from '../motion.js';
import { Ghost, Rail } from '../parts.jsx';

/*
  Экран 6. Ось как маршрут груза: пять узлов на одной линии.

  Движение — ось прочерчивается от начала к концу, отметки садятся на неё по
  ходу, одна за другой. Конечное состояние — маршрут пройден целиком.

  Ось нарисована в двух видах: горизонтальной для широкого кадра и
  вертикальной для узкого. Один и тот же маршрут, но на 390px он идёт сверху
  вниз — иначе подписи упали бы до нечитаемого кегля.
*/

const WIDE = { width: 1200, height: 290, axis: 150, first: 120, step: 240 };
const NARROW = { width: 390, height: 760, axis: 52, first: 80, step: 145 };

export function Supply({ anchor, rail, ghost, title, lead, nodes }) {
  const { ref, t } = useSectionMotion({ from: 0.06, to: 0.56 });
  const wide = useWideStage();
  const drawn = phase(t, 0, 0.55);
  const marks = phase(t, 0.25, 1);

  const wideLength = WIDE.width - 60;
  const narrowLength = NARROW.height - 48;

  return (
    <section className="kns-section" id={anchor} ref={ref}>
      <Rail>{rail}</Rail>
      <Ghost>{ghost}</Ghost>

      <h2 className="kns-heading">{title}</h2>
      {lead ? <p className="kns-lead mt-6">{lead}</p> : null}

      <div className="kns-route">
        {wide ? (
          <svg viewBox={`0 0 ${WIDE.width} ${WIDE.height}`} aria-hidden="true" focusable="false">
            <path
              className="kns-route-axis"
              d={`M30 ${WIDE.axis} H${WIDE.width - 30}`}
              strokeDasharray={wideLength}
              strokeDashoffset={wideLength * (1 - drawn)}
            />
            {nodes.map((node, index) => {
              const landed = stagger(marks, index, nodes.length, 0.42);
              const x = WIDE.first + index * WIDE.step;

              return (
                <g
                  key={node.id}
                  opacity={landed}
                  transform={`translate(${x} ${(WIDE.axis - (1 - landed) * 16).toFixed(2)})`}
                >
                  <text className="kns-route-index" x={0} y={-46} textAnchor="middle">
                    {numeral(index)}
                  </text>
                  <SupplyMark id={node.id} />
                  <path className="kns-leader" d="M0 26 V44" />
                  <text className="kns-route-title" x={0} y={68} textAnchor="middle">
                    {node.title}
                  </text>
                  <text className="kns-route-line" x={0} y={92} textAnchor="middle">
                    {node.line}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <svg viewBox={`0 0 ${NARROW.width} ${NARROW.height}`} aria-hidden="true" focusable="false">
            <path
              className="kns-route-axis"
              d={`M${NARROW.axis} 24 V${NARROW.height - 24}`}
              strokeDasharray={narrowLength}
              strokeDashoffset={narrowLength * (1 - drawn)}
            />
            {nodes.map((node, index) => {
              const landed = stagger(marks, index, nodes.length, 0.42);
              const y = NARROW.first + index * NARROW.step;

              return (
                <g
                  key={node.id}
                  opacity={landed}
                  transform={`translate(${(NARROW.axis - (1 - landed) * 14).toFixed(2)} ${y})`}
                >
                  <SupplyMark id={node.id} />
                  <path className="kns-leader" d="M26 0 H46" />
                  <text className="kns-route-index" x={56} y={-22}>
                    {numeral(index)}
                  </text>
                  <text className="kns-route-title" x={56} y={2}>
                    {node.title}
                  </text>
                  <text className="kns-route-line" x={56} y={26}>
                    {node.line}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Маршрут словами: рисунок помечен aria-hidden, список — нет. */}
      <ul className="kns-sr-only">
        {nodes.map((node) => (
          <li key={node.id}>
            {node.title} — {node.line}
          </li>
        ))}
      </ul>
    </section>
  );
}
