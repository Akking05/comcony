/**
 * Двуязычные поля в админке.
 *
 * Переводимое поле — это пара колонок: `name` и `name_en`. Показывать обе
 * рядом не выходит: у товара таких пар восемь плюс по три на каждую строку
 * характеристик, и форма перестаёт помещаться на экране. Поэтому форма
 * переключается целиком — вкладкой сверху, — а поля привязываются к колонке
 * выбранного языка.
 *
 * Пустой перевод — это не ошибка: публичный API подставит русское значение.
 * Чтобы это было видно при заполнении, на английской вкладке в подсказке
 * поля стоит русский оригинал.
 */

export const LANGS = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

/** Имя колонки для языка: ('name', 'en') → 'name_en'. */
export const column = (field, lang) => (lang === 'en' ? `${field}_en` : field);

/**
 * Пропсы для <Input>/<Textarea>, привязанные к нужной колонке.
 *
 * @param {object} source   объект с данными (form, editing, строка списка)
 * @param {string} field    имя русской колонки
 * @param {string} lang     'ru' | 'en'
 * @param {(patch: object) => void} patch  применяет частичное изменение
 * @param {string} [placeholder]           подсказка для русской вкладки
 */
export function translatable(source, field, lang, patch, placeholder = '') {
  const key = column(field, lang);

  return {
    lang,
    value: source?.[key] ?? '',
    placeholder: lang === 'en' ? source?.[field] || placeholder : placeholder,
    onChange: (event) => patch({ [key]: event.target.value }),
  };
}

/**
 * Вкладки языка.
 *
 * pending — по желанию: { en: 3 } поставит точку у вкладки, где есть
 * несохранённые правки. Без неё уход с вкладки выглядит как потеря набранного.
 */
export function LangTabs({ lang, onChange, pending, className = '' }) {
  return (
    <div
      role="radiogroup"
      aria-label="Язык содержимого"
      className={`inline-flex items-center border border-hairline-soft ${className}`}
    >
      {LANGS.map((item) => {
        const active = item.code === lang;

        return (
          <button
            key={item.code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.code)}
            className={`flex items-center gap-2 px-4 py-2 font-label-md text-label-md uppercase transition-colors duration-150 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
              active ? 'kns-roll text-ink' : 'text-ink-dim hover:bg-stencil/6 hover:text-ink'
            }`}
          >
            {item.label}
            {/* Точка несохранённых правок — единственная окружность панели.
                Акцент здесь оправдан: она сообщает состояние, которое иначе
                видно только после ухода со вкладки и потери набранного. */}
            {pending?.[item.code] > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent" title="Есть изменения"></span>
            )}
          </button>
        );
      })}
    </div>
  );
}
