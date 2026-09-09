/** Заглушка на время загрузки. Размеры задаёт место применения. */
export function Skeleton({ className = '', rounded = 'rounded' }) {
  return <div className={`animate-pulse bg-part-fill ${rounded} ${className}`}></div>;
}
