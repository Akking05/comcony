import { Component } from 'react';

/**
 * Перехватывает исключения при рендере.
 *
 * Без него любая ошибка в любом компоненте размонтирует всё дерево, и
 * посетитель видит пустой белый экран — без сообщения, без следа причины.
 *
 * Обязан быть классом: хука-аналога componentDidCatch в React нет.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // В консоль — целиком: componentStack показывает, какой именно
    // компонент упал, и без него причину приходится искать вслепую.
    console.error('Ошибка рендера:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="tech-grid pointer-events-none fixed inset-0 opacity-40"></div>

        <div className="relative w-full max-w-md rounded-sm border border-outline-variant bg-surface/80 p-8 text-center backdrop-blur-xl">
          <img src="/kae-logo.svg" alt="KAE" className="mx-auto mb-6 h-10 object-contain" />

          <span className="material-symbols-outlined mb-3 text-4xl text-primary/60">error</span>

          <h1 className="mb-3 font-headline-md text-[18px] text-white">Что-то пошло не так</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Страница не смогла отобразиться. Попробуйте обновить её — если ошибка повторится,
            напишите нам, и мы разберёмся.
          </p>

          {/* Текст ошибки — только в разработке: посетителю он ничего не
              объясняет, а в проде может выдать лишнее об устройстве кода. */}
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-sm bg-black/40 p-3 text-left font-label-mono text-[11px] text-on-surface-variant">
              {String(error?.stack || error?.message || error)}
            </pre>
          )}

          <div className="mt-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-label-sm text-[11px] uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
            >
              Обновить страницу
            </button>

            <a
              href="/"
              className="font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant transition-opacity hover:opacity-80"
            >
              На главную
            </a>
          </div>
        </div>
      </div>
    );
  }
}
