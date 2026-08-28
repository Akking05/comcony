/**
 * Мета-теги для одностраничника.
 *
 * <head> у SPA один на все маршруты, поэтому description, og:* и canonical
 * приходится переписывать вручную при каждой смене страницы.
 *
 * Это не замена серверному рендерингу: поисковик увидит теги только после
 * выполнения JS. Но превью ссылки в мессенджерах и вкладка браузера
 * начинают показывать то, что нужно, а canonical убирает дубли адресов.
 */

const SITE_NAME = 'KAE Engineering';
const DEFAULT_IMAGE = '/kae-logo.svg';

/** Создаёт, обновляет или удаляет <meta>. Пустое значение = тега быть не должно. */
function upsertMeta(key, keyAttribute, value) {
  const existing = document.head.querySelector(`meta[${keyAttribute}="${key}"]`);

  if (!value) {
    existing?.remove();
    return;
  }

  const tag = existing ?? document.head.appendChild(document.createElement('meta'));

  tag.setAttribute(keyAttribute, key);
  tag.setAttribute('content', value);
}

function upsertLink(rel, href) {
  const existing = document.head.querySelector(`link[rel="${rel}"]`);
  const tag = existing ?? document.head.appendChild(document.createElement('link'));

  tag.setAttribute('rel', rel);
  tag.setAttribute('href', href);
}

/** Абсолютный адрес: og:* и canonical относительные значения не принимают. */
const absolute = (path) => new URL(path, window.location.origin).href;

/**
 * @param {object} meta
 * @param {string} meta.title
 * @param {string} [meta.description]
 * @param {string} [meta.image]    путь к картинке превью
 * @param {string} [meta.path]     канонический путь; по умолчанию — текущий
 * @param {boolean} [meta.noindex] закрыть страницу от индексации
 */
export function applyMeta({ title, description, image, path, noindex = false }) {
  // Параметры запроса в canonical не входят: /products?from=mail и
  // /products — одна и та же страница.
  const url = absolute(path ?? window.location.pathname);
  const preview = absolute(image || DEFAULT_IMAGE);

  document.title = title;

  upsertMeta('description', 'name', description);
  upsertMeta('robots', 'name', noindex ? 'noindex, follow' : null);

  upsertMeta('og:type', 'property', 'website');
  upsertMeta('og:site_name', 'property', SITE_NAME);
  upsertMeta('og:locale', 'property', 'ru_RU');
  upsertMeta('og:title', 'property', title);
  upsertMeta('og:description', 'property', description);
  upsertMeta('og:url', 'property', url);
  upsertMeta('og:image', 'property', preview);

  upsertMeta('twitter:card', 'name', 'summary_large_image');
  upsertMeta('twitter:title', 'name', title);
  upsertMeta('twitter:description', 'name', description);
  upsertMeta('twitter:image', 'name', preview);

  upsertLink('canonical', url);
}
