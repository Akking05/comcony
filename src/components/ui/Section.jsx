/**
 * Секция страницы и её содержимое по сетке.
 *
 * `relative z-10` здесь не для красоты. Фон сайта (.page-bg) — фиксированный
 * слой с z-index: 0, и браузер рисует его позже, чем текст непозиционированных
 * блоков. Без этой пары содержимое уходит под фон; так уже случалось с
 * командой на «О компании» и с блоком призыва. Теперь об этом достаточно
 * помнить один раз — здесь.
 */

/** Вертикальный ритм. Один набор шагов на весь сайт. */
const SPACES = {
  none: '',
  sm: 'py-stack-lg',
  md: 'py-16 md:py-24',
  lg: 'py-stack-lg md:py-stack-xl',
};

/** Поля и предельная ширина — единственное место, где они заданы. */
export function Container({ as: Component = 'div', className = '', children, ...rest }) {
  return (
    <Component
      className={`mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Section({
  as: Component = 'section',
  space = 'md',
  bare = false,
  className = '',
  innerClassName = '',
  children,
  ...rest
}) {
  return (
    <Component className={`relative z-10 ${SPACES[space] ?? SPACES.md} ${className}`} {...rest}>
      {bare ? children : <Container className={innerClassName}>{children}</Container>}
    </Component>
  );
}
