/**
 * Клиент админского API. Сессия живёт в httpOnly-куке,
 * поэтому токен здесь нигде не хранится и не передаётся вручную.
 */
const BASE = '/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, form } = {}) {
  const response = await fetch(BASE + path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.error || `Ошибка ${response.status}`, response.status);
  }

  return data;
}

export const adminApi = {
  // Сессия
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // Дашборд
  stats: (days = 30) => request(`/admin/stats?days=${days}`),

  // Товары
  products: () => request('/admin/products'),
  product: (id) => request(`/admin/products/${id}`),
  createProduct: (body) => request('/admin/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/admin/products/${id}`, { method: 'PUT', body }),
  setProductStatus: (id, status) =>
    request(`/admin/products/${id}/status`, { method: 'PATCH', body: { status } }),
  reorderProducts: (order) => request('/admin/products/reorder', { method: 'POST', body: { order } }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),

  // Категории
  categories: () => request('/admin/categories'),
  createCategory: (body) => request('/admin/categories', { method: 'POST', body }),
  updateCategory: (id, body) => request(`/admin/categories/${id}`, { method: 'PUT', body }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Тексты
  texts: () => request('/admin/texts'),
  saveTexts: (values) => request('/admin/texts', { method: 'PUT', body: { values } }),

  // Команда
  team: () => request('/admin/team'),
  createMember: (body) => request('/admin/team', { method: 'POST', body }),
  updateMember: (id, body) => request(`/admin/team/${id}`, { method: 'PUT', body }),
  deleteMember: (id) => request(`/admin/team/${id}`, { method: 'DELETE' }),

  // Заявки
  requests: (status) => request(`/admin/requests${status ? `?status=${status}` : ''}`),
  updateRequest: (id, body) => request(`/admin/requests/${id}`, { method: 'PATCH', body }),
  deleteRequest: (id) => request(`/admin/requests/${id}`, { method: 'DELETE' }),

  // Медиа и документы
  media: () => request('/admin/media'),
  deleteMedia: (path) => request('/admin/media', { method: 'DELETE', body: { path } }),
  documents: () => request('/admin/media/documents'),
  updateDocument: (id, body) => request(`/admin/media/documents/${id}`, { method: 'PATCH', body }),
  deleteDocument: (id) => request(`/admin/media/documents/${id}`, { method: 'DELETE' }),

  // Пользователи
  users: () => request('/admin/users'),
  createUser: (body) => request('/admin/users', { method: 'POST', body }),
  updateUser: (id, body) => request(`/admin/users/${id}`, { method: 'PUT', body }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),

  /** Загрузка файла в медиатеку. */
  upload(file) {
    const form = new FormData();
    form.append('file', file);
    return request('/admin/media/upload', { method: 'POST', form });
  },

  /** Загрузка PDF как документа с привязкой к товару. */
  uploadDocument({ file, title, productId, type }) {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    if (productId) form.append('product_id', String(productId));
    if (type) form.append('type', type);
    return request('/admin/media/documents', { method: 'POST', form });
  },

  replaceDocumentFile(id, file) {
    const form = new FormData();
    form.append('file', file);
    return request(`/admin/media/documents/${id}/file`, { method: 'PUT', form });
  },
};
