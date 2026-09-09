/**
 * Поверхность под содержимое.
 *
 * Три уровня вместо одного. Раньше `.glass-panel` стоял на двадцати шести
 * блоках подряд, из-за чего всё лежало в одной плоскости и глубины не было
 * ни у чего. Стекло стоит дорого и по отрисовке (backdrop-filter), и по
 * вниманию — поэтому оно для главного, а рядовым блокам достаётся рамка.
 */
const TIERS = {
  /** Ключевые блоки и оверлеи: размытие подложки. */
  glass: 'glass-panel',
  /** Карточка каталога: реагирует на наведение подъёмом. */
  card: 'glass-card',
  /** Рядовой блок: рамка и плотный фон, без размытия. */
  plain: 'border border-hairline-soft',
};

export function Panel({ tier = 'glass', as: Component = 'div', className = '', children, ...rest }) {
  return (
    <Component className={`${TIERS[tier] ?? TIERS.glass} ${className}`} {...rest}>
      {children}
    </Component>
  );
}
