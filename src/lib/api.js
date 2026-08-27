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

export const api = {
  async products(signal) {
    if (DEMO_MODE) return (await loadDemoData()).products;

    return request('/products', { signal });
  },

  async product(slug, signal) {
    if (DEMO_MODE) {
      const found = (await loadDemoData()).details[slug];

      if (!found) {
        const error = new Error('Товар не найден');
        error.status = 404;
        throw error;
      }

      return found;
    }

    return request(`/products/${encodeURIComponent(slug)}`, { signal });
  },

  async texts(signal) {
    if (DEMO_MODE) return (await loadDemoData()).texts;

    return request('/texts', { signal });
  },

  async team(signal) {
    if (DEMO_MODE) return (await loadDemoData()).team;

    return request('/team', { signal });
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
