import { LANGUAGES, useLang } from '../../lib/i18n.jsx';

/**
 * Переключатель языка.
 *
 * Сегментированный тумблер, а не выпадающий список: языка всего два, и оба
 * должны быть видны сразу — иначе посетитель не знает, что английский вообще
 * есть, пока не откроет список.
 *
 * Разметка — группа радиокнопок, а не набор ссылок: язык не меняет адрес
 * страницы. Программа чтения с экрана объявляет её как «переключатель языка»
 * и называет выбранный вариант.
 */

const SIZES = {
  sm: 'px-2.5 py-1 text-label-2xs',
  md: 'px-3 py-1.5 text-label-xs',
};

export function LangSwitch({ size = 'sm', className = '' }) {
  const { lang, setLang, t } = useLang();
  const padding = SIZES[size] ?? SIZES.sm;

  return (
    <div
      role="radiogroup"
      aria-label={t('common.language_switch')}
      className={`inline-flex shrink-0 items-center gap-px border border-hairline p-px ${className}`}
    >
      {LANGUAGES.map((item) => {
        const active = item.code === lang;

        return (
          <button
            key={item.code}
            type="button"
            role="radio"
            aria-checked={active}
            // lang на самой кнопке: «English» и «Русский» — слова разных
            // языков внутри одного меню, и синтезатор речи должен
            // переключаться на каждом.
            lang={item.code}
            title={item.name}
            onClick={() => setLang(item.code)}
            className={`font-label-mono text-label-mono uppercase transition-colors duration-200 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${padding} ${
              active
                ? 'bg-stencil text-accent-ink'
                : 'text-ink-dim hover:text-stencil'
            }`}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}
