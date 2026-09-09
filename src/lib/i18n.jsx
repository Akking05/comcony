/**
 * Два языка сайта: русский и английский.
 *
 * Строк интерфейса тут нет — они в src/locales/. Здесь только выбор языка:
 * откуда он берётся при первом заходе, где хранится между визитами и как
 * до него добраться из компонента.
 *
 * Порядок определения — от самого явного к самому общему:
 *   1) ?lang=en в адресе — чтобы можно было дать англоязычную ссылку;
 *   2) выбор, сохранённый в прошлый раз;
 *   3) язык браузера;
 *   4) русский.
 *
 * В адресную строку язык не дописывается: у каждой страницы должен остаться
 * один канонический адрес, иначе поисковик увидит дубли. Ссылка с ?lang=
 * работает как разовое указание, дальше его помнит localStorage.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ru } from '../locales/ru.js';
import { en } from '../locales/en.js';

const DICTIONARIES = { ru, en };

export const DEFAULT_LANG = 'ru';

/** Порядок здесь — порядок кнопок в переключателе. */
export const LANGUAGES = [
  { code: 'ru', short: 'RU', name: 'Русский', locale: 'ru_RU' },
  { code: 'en', short: 'EN', name: 'English', locale: 'en_US' },
];

const STORAGE_KEY = 'kae.lang';

export const isLang = (value) => Object.hasOwn(DICTIONARIES, String(value));

export const localeOf = (lang) => LANGUAGES.find((item) => item.code === lang)?.locale ?? 'ru_RU';

/**
 * Подставляет значения в строку: 'Запрос цены: {name}' + { name: 'MX-5' }.
 * Незаполненный placeholder остаётся как есть — так его видно при отладке.
 */
function interpolate(template, values) {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}

/**
 * Перевод вне React: экран ошибки и другие места, куда контекст не достаёт.
 *
 * Пропущенный ключ — не ошибка: сначала пробуем русский, и только если его
 * тоже нет, возвращаем сам ключ. Пустой экран из-за незаведённой строки
 * хуже, чем строка на другом языке.
 */
export function translate(lang, key, values) {
  const template = DICTIONARIES[lang]?.[key] ?? DICTIONARIES[DEFAULT_LANG][key] ?? key;

  return interpolate(template, values);
}

/** Язык из адреса → из хранилища → из браузера → русский. */
export function detectLang() {
  if (typeof window === 'undefined') return DEFAULT_LANG;

  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;

  // Приватный режим и запрет на хранилище бросают исключение на самом
  // обращении к localStorage — не только на записи.
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* хранилище недоступно — определяем по браузеру */
  }

  const browser = String(navigator.language || '').slice(0, 2).toLowerCase();

  return isLang(browser) ? browser : DEFAULT_LANG;
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* без хранилища язык просто не переживёт перезагрузку */
    }
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang: (next) => setLang(isLang(next) ? next : DEFAULT_LANG),
      t: (key, values) => translate(lang, key, values),
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * @returns {{ lang: string, setLang: (code: string) => void, t: (key: string, values?: object) => string }}
 */
export function useLang() {
  const context = useContext(LanguageContext);

  if (!context) throw new Error('useLang вызван вне <LanguageProvider>');

  return context;
}

/**
 * Только функция перевода — самый частый случай.
 * Пишется как `const t = useT();` и дальше `t('nav.products')`.
 */
export function useT() {
  return useLang().t;
}
