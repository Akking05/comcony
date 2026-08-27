/**
 * Клиент API сайта. Путь всегда относительный: в разработке его проксирует
 * Vite, на проде — nginx.
 */
const BASE = '/api';

async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(BASE + path, {
    method,
    signal,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error || `Ошибка ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  products: (signal) => request('/products', { signal }),
  product: (slug, signal) => request(`/products/${encodeURIComponent(slug)}`, { signal }),
  texts: (signal) => request('/texts', { signal }),
  team: (signal) => request('/team', { signal }),
  submitRequest: (body) => request('/requests', { method: 'POST', body }),
};

/**
 * Отправка события аналитики. Намеренно «тихая»: сбой счётчика
 * не должен ломать страницу.
 */
export function track(event) {
  request('/track', { method: 'POST', body: event }).catch(() => {});
}
