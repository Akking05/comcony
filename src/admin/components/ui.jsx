import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/*
  Словарь панели управления.

  Панель наследует материал мира — землю, чернила, хайрлайн, трафаретную
  маркировку, ноль скруглений, — но живёт в другом режиме: ею работают, а не
  любуются. Отсюда три отличия от публичного сайта:

  · стекла, размытия и теней нет вовсе. Их убрали не ради стиля: слой
    `backdrop-filter` перерисовывается на каждый скролл длинной таблицы,
    и это единственное место сайта, где такие таблицы бывают;
  · акцент один и он принадлежит действию. Выбранная строка, активный
    раздел и текущая вкладка помечаются плотностью краски и хайрлайном —
    так на экране с формой, меню и таблицей остаётся ровно одна синяя точка,
    и это кнопка «Сохранить»;
  · у каждого элемента есть все состояния: покой, наведение, фокус,
    нажатие, запрет, загрузка. Полкомплекта — это не стиль, а поломка.

  Формы, таблицы и кнопки остаются формами, таблицами и кнопками.
*/

// ---------------------------------------------------------------------------
// Кнопки
// ---------------------------------------------------------------------------

const FOCUS =
  'outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const BUTTON_VARIANTS = {
  /** Главное действие экрана. Единственное место панели с полным акцентом. */
  primary:
    'border border-accent bg-accent text-accent-ink hover:bg-transparent hover:text-accent active:bg-accent/80 active:text-accent-ink',
  /** Рядовое действие: та же форма, тише голос. */
  secondary:
    'border border-hairline text-ink hover:border-stencil hover:bg-stencil/8 active:bg-stencil/14',
  /** Действие внутри строки или заголовка панели. */
  ghost: 'border border-transparent text-ink-dim hover:border-hairline-soft hover:text-ink active:bg-stencil/10',
  /** Необратимое действие. Красный здесь — предупреждение, а не украшение. */
  danger:
    'border border-red-400/45 text-red-300 hover:border-red-400/80 hover:bg-red-500/12 active:bg-red-500/20',
};

export function Button({ variant = 'secondary', icon, children, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-9 items-center justify-center gap-2 px-4 py-2 font-label-md text-label-md uppercase transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent ${FOCUS} ${BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.secondary} ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
}

export function IconButton({ icon, title, className = '', ...props }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      {...props}
      className={`inline-flex h-9 w-9 items-center justify-center border border-transparent text-ink-dim transition-colors duration-150 hover:border-hairline-soft hover:text-ink active:bg-stencil/12 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS} ${className}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Поля ввода
// ---------------------------------------------------------------------------

/*
  Одна форма поля на всю панель. Границы видно в покое: невидимое поле
  ввода заставляет целиться в текст, а не в поле.
*/
const FIELD_CLASS =
  'w-full border border-hairline bg-part-fill px-3 py-2 font-body-md text-[15px] text-ink outline-none transition-colors duration-150 placeholder:text-ink-quiet hover:border-stencil-dim focus:border-accent disabled:cursor-not-allowed disabled:opacity-50';

export function Field({ label, hint, children, required }) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="block font-label-2xs text-label-2xs uppercase text-stencil">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      )}
      {children}
      {hint && <span className="block font-label-2xs text-label-2xs text-ink-dim">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return <input {...props} className={`${FIELD_CLASS} ${props.className ?? ''}`} />;
}

export function Textarea(props) {
  return <textarea {...props} className={`${FIELD_CLASS} resize-y ${props.className ?? ''}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${FIELD_CLASS} ${props.className ?? ''}`}>
      {children}
    </select>
  );
}

// ---------------------------------------------------------------------------
// Контейнеры и состояния
// ---------------------------------------------------------------------------

export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`border border-hairline-soft ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-hairline-soft px-5 py-3">
          <h2 className="font-title-sm text-[15px] uppercase text-ink">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, children }) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-hairline pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline-md text-[26px] uppercase text-ink">{title}</h1>
        {description && <p className="mt-1 font-body-md text-[15px] text-ink-dim">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/*
  Отметка состояния. Прямоугольник, а не пилюля: скруглений в этом мире нет.
  Цветом отмечены только те состояния, где цвет несёт смысл (ошибка,
  ожидание); «всё в порядке» отмечается плотностью, а не второй синей точкой
  рядом с кнопкой действия.
*/
const BADGE_TONES = {
  neutral: 'border-hairline-soft text-ink-dim',
  success: 'border-hairline bg-stencil/10 text-stencil',
  warning: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  danger: 'border-red-400/40 bg-red-400/10 text-red-300',
};

export function Badge({ tone = 'neutral', children }) {
  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 font-label-2xs text-label-2xs uppercase ${
        BADGE_TONES[tone] ?? BADGE_TONES.neutral
      }`}
    >
      {children}
    </span>
  );
}

/** Пусто — это не «ничего нет», а объяснение, что здесь появится и как. */
export function EmptyState({ icon = 'inbox', title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="material-symbols-outlined text-4xl text-stencil-dim">{icon}</span>
      <p className="font-title-sm text-[16px] uppercase text-ink">{title}</p>
      {description && <p className="max-w-md font-body-md text-[15px] text-ink-dim">{description}</p>}
      {children}
    </div>
  );
}

export function Spinner({ label = 'Загрузка…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-14 text-ink-dim">
      <span className="h-4 w-4 animate-spin rounded-full border border-hairline border-t-stencil"></span>
      <span className="font-label-md text-label-md uppercase">{label}</span>
    </div>
  );
}

/** Прямоугольник-заглушка на время загрузки: полоса вместо волчка в тексте. */
export function SkeletonRow({ className = '' }) {
  return <div className={`h-4 animate-pulse bg-part-fill ${className}`}></div>;
}

export function ErrorState({ error, onRetry }) {
  return (
    <EmptyState icon="cloud_off" title="Не удалось загрузить данные" description={error?.message}>
      {onRetry && (
        <Button variant="secondary" icon="refresh" onClick={onRetry} className="mt-2">
          Повторить
        </Button>
      )}
    </EmptyState>
  );
}

// ---------------------------------------------------------------------------
// Уведомления
// ---------------------------------------------------------------------------

const ToastContext = createContext(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);

    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 border px-4 py-3 ${
              toast.tone === 'error'
                ? 'border-red-400/40 bg-red-500/12 text-red-200'
                : 'border-hairline bg-part-fill text-ink'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toast.tone === 'error' ? 'error' : 'check_circle'}
            </span>
            <span className="font-body-md text-[15px]">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Подтверждение действия
// ---------------------------------------------------------------------------

/**
 * Спрашивается только там, где отменить нельзя: удаление.
 * Всё остальное панель делает сразу и даёт откатить, а не переспрашивает.
 */
export function ConfirmDialog({ open, title, description, confirmLabel = 'Удалить', onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ground-deep/85" onClick={onCancel}></div>
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md border border-hairline bg-ground p-6"
      >
        <h2 className="font-title-md text-[18px] uppercase text-ink">{title}</h2>
        {description && <p className="mt-2 font-body-md text-[15px] text-ink-dim">{description}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Вспомогательное
// ---------------------------------------------------------------------------

export function formatDate(value) {
  if (!value) return '—';

  // SQLite отдаёт "YYYY-MM-DD HH:MM:SS" в UTC.
  const date = new Date(value.replace(' ', 'T') + (value.includes('Z') ? '' : 'Z'));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatSize(bytes) {
  if (!bytes) return '—';

  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}
