import { Component } from 'react';

import { detectLang, translate } from '../lib/i18n.jsx';
import { Icon } from './ui/Icon.jsx';

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

    // Контекста языка здесь нет и быть не может: этот экран показывается
    // как раз тогда, когда дерево под ним не смонтировалось. Читаем выбор
    // напрямую — он лежит в localStorage.
    const t = (key) => translate(detectLang(), key);

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="tech-grid pointer-events-none fixed inset-0 opacity-40"></div>

        <div className="relative w-full max-w-md rounded-sm border border-hairline bg-ground p-8 text-center">
          <img src="/kae-logo.svg" alt="KAE" className="mx-auto mb-6 h-10 object-contain" />

          <Icon name="error" size="3xl" className="mb-3 text-stencil-dim" />

          <h1 className="mb-3 font-title-sm text-title-sm text-ink">{t('error.title')}</h1>
          <p className="font-body-md text-body-md text-ink-dim">{t('error.text')}</p>

          {/* Текст ошибки — только в разработке: посетителю он ничего не
              объясняет, а в проде может выдать лишнее об устройстве кода. */}
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-sm bg-ground-deep p-3 text-left font-label-mono text-label-xs text-ink-dim">
              {String(error?.stack || error?.message || error)}
            </pre>
          )}

          <div className="mt-6 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-label-xs text-label-xs uppercase tracking-widest text-stencil transition-colors hover:text-ink"
            >
              {t('error.reload')}
            </button>

            <a
              href="/"
              className="font-label-xs text-label-xs uppercase tracking-widest text-ink-dim transition-opacity hover:opacity-80"
            >
              {t('common.home')}
            </a>
          </div>
        </div>
      </div>
    );
  }
}
