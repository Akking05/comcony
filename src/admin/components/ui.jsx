import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Кнопки
// ---------------------------------------------------------------------------

const BUTTON_VARIANTS = {
  primary:
    'bg-primary-container text-on-primary-container hover:brightness-110 disabled:hover:brightness-100',
  secondary: 'bg-white/5 text-on-surface border border-outline-variant hover:bg-white/10 hover:text-white',
  ghost: 'text-on-surface-variant hover:text-primary hover:bg-white/5',
  danger: 'bg-red-500/10 text-red-300 border border-red-400/30 hover:bg-red-500/20',
};

export function Button({ variant = 'secondary', icon, children, className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 font-label-md text-label-md transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60 ${BUTTON_VARIANTS[variant]} ${className}`}
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
      className={`inline-flex h-9 w-9 items-center justify-center rounded-sm text-on-surface-variant transition-all hover:bg-white/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60 ${className}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Поля ввода
// ---------------------------------------------------------------------------

const FIELD_CLASS =
  'w-full rounded-sm border border-white/10 bg-surface/60 px-3 py-2 font-body-md text-body-md text-white outline-none transition-all placeholder:text-white/25 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50';

export function Field({ label, hint, children, required }) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="block font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
          {label}
          {required && <span className="text-primary"> *</span>}
        </span>
      )}
      {children}
      {hint && <span className="block font-label-sm text-[11px] text-outline">{hint}</span>}
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
    <section className={`rounded-sm border border-outline-variant/60 bg-surface/40 backdrop-blur-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-outline-variant/60 px-5 py-3.5">
          <h2 className="font-headline-md text-[15px] uppercase tracking-wide text-white">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, children }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline-lg text-[26px] uppercase tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1 font-body-md text-body-md text-on-surface-variant">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'border-outline-variant text-on-surface-variant',
    success: 'border-primary/40 bg-primary/10 text-primary',
    warning: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    danger: 'border-red-400/40 bg-red-400/10 text-red-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-label-sm text-[10px] uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ icon = 'inbox', title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="material-symbols-outlined text-4xl text-outline/50">{icon}</span>
      <p className="font-headline-md text-[16px] text-white">{title}</p>
      {description && <p className="max-w-md font-body-md text-body-md text-on-surface-variant">{description}</p>}
      {children}
    </div>
  );
}

export function Spinner({ label = 'Загрузка…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-on-surface-variant">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
      <span className="font-label-md text-label-md">{label}</span>
    </div>
  );
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
            className={`pointer-events-auto flex items-center gap-3 rounded-sm border px-4 py-3 backdrop-blur-xl ${
              toast.tone === 'error'
                ? 'border-red-400/40 bg-red-500/10 text-red-200'
                : 'border-primary/40 bg-primary/10 text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toast.tone === 'error' ? 'error' : 'check_circle'}
            </span>
            <span className="font-body-md text-body-md">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Подтверждение действия
// ---------------------------------------------------------------------------

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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel}></div>
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-sm border border-outline-variant bg-surface p-6 shadow-2xl"
      >
        <h2 className="font-headline-md text-[18px] text-white">{title}</h2>
        {description && <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{description}</p>}
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
