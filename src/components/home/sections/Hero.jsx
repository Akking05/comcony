import { useLenis } from 'lenis/react';

import { Button } from '../../ui/index.js';
import { RadioPartShape } from '../graphics.jsx';
import {
  NARROW_LAYOUT,
  WIDE_LAYOUT,
  center,
  packedPoint,
} from '../heroLayout.js';
import { clamp01, easeOut, lerp, numeral, phase, useSectionMotion, useWideStage } from '../motion.js';
import { Placeholder } from '../parts.jsx';

/*
  Экран 1. Кофр.

  Закрытый ящик смещён вправо и занимает две трети кадра. По ходу скролла
  крышка уходит на петлю, рация встаёт из ложемента и расходится на шесть
  частей — каждая ложится в свой карман, к каждой приходит выносная линия с
  моноширинной строкой позиции. Части не улетают за габарит: всё, что
  происходит, происходит внутри ящика, и в конце это упаковочный лист.

  Конечное состояние — разложенное. Оно же стоит при `prefers-reduced-motion`
  и до первого замера: сборка обратно в ящик — то, что движение добавляет,
  а не то, без чего страница неполна.
*/

function CaseStage({ layout, parts, caption, wordmark, t, idPrefix, className }) {
  const byId = new Map();
  parts.forEach((part, index) => byId.set(part.id, { part, index }));

  /* Крышка уходит первой, потом детали расходятся, подписи приходят последними. */
  const lid = easeOut(phase(t, 0, 0.34));
  const spread = easeOut(phase(t, 0.24, 0.94));
  const labels = clamp01(phase(t, 0.6, 1));

  const { shell, bed, band } = layout;
  const clipId = `${idPrefix}-shell`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      preserveAspectRatio="xMaxYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={shell.x} y={shell.y} width={shell.w} height={shell.h} />
        </clipPath>
      </defs>

      {/* Корпус ящика и его углы */}
      <g>
        <rect className="kns-shell" x={shell.x} y={shell.y} width={shell.w} height={shell.h} />
        <rect className="kns-foam" x={bed.x} y={bed.y} width={bed.w} height={bed.h} />
        {[
          [shell.x, shell.y, 1, 1],
          [shell.x + shell.w, shell.y, -1, 1],
          [shell.x, shell.y + shell.h, 1, -1],
          [shell.x + shell.w, shell.y + shell.h, -1, -1],
        ].map(([cx, cy, sx, sy], index) => (
          <path
            key={index}
            className="kns-leader"
            strokeWidth={2}
            d={`M${cx} ${cy + sy * 34} L${cx} ${cy} L${cx + sx * 34} ${cy}`}
          />
        ))}
      </g>

      {/* Нижний борт: место маркировки груза */}
      <g opacity={lid}>
        <path
          className="kns-leader"
          d={`M${band.x} ${band.y} H${band.x + band.w}`}
          strokeDasharray="10 6"
        />
        {Array.from({ length: 9 }, (unused, index) => (
          <path
            key={index}
            className="kns-leader"
            d={`M${band.x + 16 + index * 26} ${band.y + band.h - 20} v${index % 3 === 0 ? -22 : -12}`}
          />
        ))}
        <text
          className="kns-role"
          x={band.x + band.w}
          y={band.y + band.h - 22}
          fontSize={layout.nameSize}
          textAnchor="end"
        >
          {caption}
        </text>
      </g>

      <g clipPath={`url(#${clipId})`}>
        {/* Карманы ложемента: пусты ровно настолько, насколько деталь ушла */}
        <g opacity={spread}>
          {layout.slots.map((slot) => (
            <rect
              key={slot.id}
              className="kns-pocket"
              x={slot.pocket.x}
              y={slot.pocket.y}
              width={slot.pocket.w}
              height={slot.pocket.h}
            />
          ))}
        </g>

        {/* Шесть частей */}
        {layout.slots.map((slot) => {
          const from = packedPoint(layout, slot.id);
          const to = center(slot.pocket);
          const scale = lerp(layout.packedScale, layout.openScale, spread);
          const lift = Math.sin(Math.PI * spread) * (layout.height * 0.03);

          return (
            <g
              key={slot.id}
              className="kns-part"
              transform={`translate(${lerp(from.x, to.x, spread).toFixed(2)} ${(
                lerp(from.y, to.y, spread) - lift
              ).toFixed(2)}) scale(${scale.toFixed(4)})`}
            >
              <RadioPartShape id={slot.id} />
            </g>
          );
        })}

        {/* Выноски: линия к узлу и моноширинная строка позиции */}
        <g opacity={labels}>
          {layout.slots.map((slot) => {
            const entry = byId.get(slot.id);
            if (!entry) return null;

            const { anchor, elbow, shelf, align } = slot.callout;
            const textX = align === 'start' ? Math.min(elbow.x, shelf.x) : Math.max(elbow.x, shelf.x);

            return (
              <g key={slot.id}>
                <path
                  className="kns-leader"
                  d={`M${anchor.x} ${anchor.y} L${elbow.x} ${elbow.y} L${shelf.x} ${shelf.y}`}
                />
                <circle className="kns-shelf" cx={anchor.x} cy={anchor.y} r={3.5} />
                <text
                  className="kns-name"
                  x={textX}
                  y={shelf.y - 10}
                  fontSize={layout.nameSize}
                  textAnchor={align}
                >
                  {numeral(entry.index)} · {entry.part.name}
                </text>
                {layout.roleSize > 0 ? (
                  <text
                    className="kns-role"
                    x={textX}
                    y={shelf.y + 18}
                    fontSize={layout.roleSize}
                    textAnchor={align}
                  >
                    {entry.part.role}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </g>

      {/* Крышка: уходит на петлю по левому борту и открывает ложемент */}
      <g
        transform={`translate(${shell.x} 0) scale(${(1 - 0.94 * lid).toFixed(4)} 1) translate(${-shell.x} 0)`}
      >
        <rect className="kns-lid-face" x={shell.x} y={shell.y} width={shell.w} height={shell.h} />
        <g opacity={Math.max(0, 1 - lid * 1.6)}>
          <rect
            className="kns-leader"
            x={shell.x + 30}
            y={shell.y + 30}
            width={shell.w - 60}
            height={shell.h - 60}
            fill="none"
            strokeDasharray="18 9"
          />
          <text
            className="kns-stencil-text"
            x={shell.x + shell.w / 2}
            y={shell.y + shell.h * 0.44}
            fontSize={layout.width > 800 ? 74 : 30}
            textAnchor="middle"
          >
            {wordmark}
          </text>
          <path
            className="kns-shelf"
            d={`M${shell.x + shell.w * 0.2} ${shell.y + shell.h * 0.5} H${shell.x + shell.w * 0.8}`}
            strokeDasharray="30 10"
          />
          <text
            className="kns-role"
            x={shell.x + shell.w / 2}
            y={shell.y + shell.h * 0.58}
            fontSize={layout.nameSize}
            textAnchor="middle"
          >
            {caption}
          </text>
        </g>
        {/* Замки и петли: их видно и на закрытой, и на приоткрытой крышке */}
        <g className="kns-leader" strokeWidth={2} fill="none">
          <path d={`M${shell.x + shell.w - 26} ${shell.y + shell.h * 0.34} h18 v34 h-18 z`} />
          <path d={`M${shell.x + shell.w - 26} ${shell.y + shell.h * 0.58} h18 v34 h-18 z`} />
          <path d={`M${shell.x + 8} ${shell.y + shell.h * 0.34} h-16 v34 h16 z`} />
          <path d={`M${shell.x + 8} ${shell.y + shell.h * 0.58} h-16 v34 h16 z`} />
        </g>
      </g>
    </svg>
  );
}

export function Hero({ t, wordmark, status, title, lead, parts, caption, screens, catalog }) {
  const { ref, t: progress } = useSectionMotion({ from: 0.3, to: 0.68, ease: false });
  /*
    Указатель экранов ведёт прокруткой Lenis, а не браузерной: Lenis держит
    собственную позицию и на ближайшем кадре возвращает её на место, поэтому
    родной переход по якорю здесь просто отменялся бы. Без Lenis (её нет,
    например, в отдельном рендере секции) ссылка остаётся обычной ссылкой.
  */
  const lenis = useLenis();
  const goTo = (anchor) => (event) => {
    if (!lenis) return;

    event.preventDefault();
    lenis.scrollTo(`#${anchor}`, { offset: -24 });
  };
  // Сцена, которой на экране нет, не считается: шесть трансформов и выносок
  // на каждом кадре скролла для скрытого рисунка считать некому.
  const wide = useWideStage();
  const layout = wide ? WIDE_LAYOUT : NARROW_LAYOUT;

  return (
    <section className="kns-hero" ref={ref}>
      <div className="kns-hero-stage">
        <p className="kns-hero-mark">
          <span className="kns-hero-mark-strong">{wordmark}</span>
          <span className="kns-hero-rule" aria-hidden="true" />
          <Placeholder label={t('home.batch')} />
        </p>

        <div className="kns-hero-body">
          <div className="kns-hero-canvas">
            <CaseStage
              className={wide ? 'kns-hero-wide' : 'kns-hero-narrow'}
              layout={layout}
              parts={parts}
              caption={caption}
              wordmark={wordmark}
              t={progress}
              idPrefix={wide ? 'kns-wide' : 'kns-narrow'}
            />
          </div>

          <div className="kns-hero-text">
            <p className="kns-hero-status">{status}</p>
            <h1 className="kns-hero-title">{title}</h1>
            {lead ? <p className="kns-hero-lead">{lead}</p> : null}
            <Button href={catalog.href} size="lg" iconEnd="arrow_forward">
              {catalog.label}
            </Button>
          </div>

          <ul className="kns-hero-index" aria-label={t('home.screen_index')}>
            {screens.map((screen, index) => (
              <li key={screen.anchor}>
                <a
                  className="kns-hero-index-item"
                  href={`#${screen.anchor}`}
                  onClick={goTo(screen.anchor)}
                >
                  <span>{numeral(index)}</span>
                  <span>{screen.label}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Состав рации словами: рисунок помечен aria-hidden, список — нет. */}
          <ul className="kns-sr-only">
            <li>{caption}</li>
            {parts.map((part) => (
              <li key={part.id}>
                {part.name} — {part.role}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
