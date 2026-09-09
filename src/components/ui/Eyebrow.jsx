/**
 * Надзаголовок над крупным заголовком: точка-индикатор и короткая подпись
 * прописными. Встречался на четырёх страницах, каждый раз с чуть другой
 * разрядкой и другим размером.
 */
const TONES = {
  primary: 'text-stencil',
  secondary: 'text-stencil',
  muted: 'text-ink-quiet',
};

export function Eyebrow({ tone = 'primary', dot = true, as: Component = 'div', className = '', children }) {
  return (
    <Component className={`flex items-center gap-3 ${className}`}>
      {dot && <span aria-hidden="true" className="h-px w-6 shrink-0 bg-stencil-dim"></span>}
      <span className={`font-label-sm text-label-sm uppercase ${TONES[tone] ?? TONES.primary}`}>
        {children}
      </span>
    </Component>
  );
}
