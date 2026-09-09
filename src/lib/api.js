/**
 * Клиент API сайта. Путь всегда относительный: в разработке его проксирует
 * Vite, на проде — nginx.
 */
const BASE = '/api';

/**
 * Витринный режим для статического хостинга без бэкенда (Vercel).
 * Включается только сборкой с VITE_STATIC_DEMO=1 — на VPS этот код
 * вырезается целиком, и запросы всегда идут в настоящий API.
 */
export const DEMO_MODE = import.meta.env.VITE_STATIC_DEMO === '1';

let demoData = null;

async function loadDemoData() {
  if (!demoData) {
    const response = await fetch('/demo-data.json');

    if (!response.ok) throw new Error('Не удалось загрузить демонстрационные данные');

    demoData = await response.json();
  }

  return demoData;
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(BASE + path, {
    method,
    signal,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const raw = await response.text();
  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // Тело пришло не в JSON. Обычно это index.html: сервер отдал SPA вместо
    // API — значит /api/* не проксируется на бэкенд. Молча вернуть null нельзя,
    // иначе страница отрисуется пустой без единого признака поломки.
    if (response.ok) {
      throw new Error('Сервер вернул не JSON. Проверьте, что /api проксируется на бэкенд.');
    }
  }

  if (!response.ok) {
    const error = new Error(data?.error || `Ошибка ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Язык в адресе запроса. Русский — значение по умолчанию на сервере,
 * поэтому для него параметр не добавляется: так у главного языка остаётся
 * один адрес, а не два одинаковых по смыслу.
 */
const withLang = (path, lang) => (lang && lang !== 'ru' ? `${path}${path.includes('?') ? '&' : '?'}lang=${encodeURIComponent(lang)}` : path);

/**
 * Витринный набор на выбранном языке. Снимок хранит языки отдельными
 * наборами (products, products_en); собранный до появления второго языка
 * возвращает русский, а не пустоту.
 */
const demoSet = (demo, name, lang) => (lang === 'ru' ? demo[name] : demo[`${name}_${lang}`] ?? demo[name]);

export const api = {
  async products(lang = 'ru', signal) {
    if (DEMO_MODE) return demoSet(await loadDemoData(), 'products', lang);

    return request(withLang('/products', lang), { signal });
  },

  async product(slug, lang = 'ru', signal) {
    if (DEMO_MODE) {
      const found = demoSet(await loadDemoData(), 'details', lang)[slug];

      if (!found) {
        const error = new Error('Товар не найден');
        error.status = 404;
        throw error;
      }

      return found;
    }

    return request(withLang(`/products/${encodeURIComponent(slug)}`, lang), { signal });
  },

  /**
   * Тексты страниц на выбранном языке.
   *
   * Ключи одинаковы для обоих языков, значения — разные. Незаполненный
   * английский вариант сервер подменяет русским, поэтому неполный перевод
   * даёт смешанную страницу, а не дырки на месте абзацев.
   */
  async texts(lang = 'ru', signal) {
    if (DEMO_MODE) return demoSet(await loadDemoData(), 'texts', lang);

    return request(withLang('/texts', lang), { signal });
  },

  async team(lang = 'ru', signal) {
    if (DEMO_MODE) return demoSet(await loadDemoData(), 'team', lang);

    return request(withLang('/team', lang), { signal });
  },

  async submitRequest(body) {
    if (DEMO_MODE) {
      throw new Error('Это демонстрационная версия — заявки не отправляются.');
    }

    return request('/requests', { method: 'POST', body });
  },
};

/**
 * Отправка события аналитики. Намеренно «тихая»: сбой счётчика
 * не должен ломать страницу.
 */
export function track(event) {
  if (DEMO_MODE) return;

  request('/track', { method: 'POST', body: event }).catch(() => {});
}
