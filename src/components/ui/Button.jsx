import { Icon } from './Icon.jsx';

/**
 * Главное действие страницы.
 *
 * До появления этого компонента одна и та же кнопка была написана семью
 * разными способами: паддинги от px-6 py-2 до px-12 py-5, два радиуса
 * скругления и три несовпадающих поведения при наведении. По отдельности
 * незаметно, вместе — сайт выглядит несобранным.
 *
 * Форма мира: прямоугольник без скругления, моноширинная подпись
 * прописными, единственный акцент в кадре. Свечения нет — ни в покое,
 * ни при наведении: в мире транспортной маркировки краска не светится.
 * При наведении кнопка выворачивается (заливка уходит в контур) и
 * расходится зазором в сторону движения — жест туда же, куда ведёт
 * ссылка. Размер при этом не меняется: прежний `hover:scale-95` уводил
 * кнопку из-под курсора, то есть двигался против намерения нажать.
 */

const VARIANTS = {
  // Одно на экран. Единственное место, где синий берётся в полную силу.
  primary:
    'bg-accent text-accent-ink border border-accent hover:bg-transparent hover:text-accent focus-visible:bg-transparent focus-visible:text-accent',

  // Действие рядом с главным: та же форма, тише голос.
  outline:
    'border border-hairline text-ink hover:border-stencil hover:text-stencil focus-visible:border-stencil',

  // Ссылка-действие внутри текста или карточки: подчёркнута хайрлайном,
  // а не окрашена — акцент в кадре уже занят.
  ghost: 'border-b border-hairline text-stencil hover:text-ink focus-visible:text-ink',
};

const SIZES = {
  sm: { padding: 'px-4 py-2.5', text: 'text-label-sm' },
  md: { padding: 'px-5 py-3.5', text: 'text-label-md' },
  lg: { padding: 'px-7 py-4', text: 'text-label-md' },
};

const FOCUS = 'outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent';

export function Button({
  href,
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  block = false,
  className = '',
  children,
  ...rest
}) {
  const { padding, text } = SIZES[size] ?? SIZES.md;

  const classes = [
    'group inline-flex items-center justify-center gap-3 font-label-md uppercase',
    'transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
    'hover:gap-5 focus-visible:gap-5',
    text,
    variant === 'ghost' ? 'py-3' : padding,
    VARIANTS[variant] ?? VARIANTS.primary,
    block ? 'w-full' : '',
    FOCUS,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon && <Icon name={icon} size="sm" />}
      {children}
      {iconEnd && <Icon name={iconEnd} size="sm" />}
    </>
  );

  // Переход — это ссылка, а не кнопка: должны работать средний клик,
  // «открыть в новой вкладке» и предпросмотр адреса в строке состояния.
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
