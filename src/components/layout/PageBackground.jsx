/**
 * Фон страницы: подложка с глубиной, топографические кольца, дрейфующие
 * свечения, инженерная сетка, зерно и виньетка.
 *
 * Всё рисуется средствами CSS — ни одного загружаемого файла. Анимация
 * отключается при prefers-reduced-motion (правило в styles.css).
 */
export function PageBackground() {
  return (
    <div className="page-bg" aria-hidden="true">
      <div className="bg-base"></div>
      <div className="bg-topo"></div>
      <div className="bg-glow"></div>
      <div className="bg-grid"></div>
      <div className="bg-grain"></div>
      <div className="bg-vignette"></div>
    </div>
  );
}
