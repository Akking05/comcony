import { useEffect, useState } from 'react';

import About from './pages/About.jsx';
import Contacts from './pages/Contacts.jsx';
import Home from './pages/Home.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Products from './pages/Products.jsx';
import { usePageEffects } from './hooks/usePageEffects.js';
import { track } from './lib/api.js';

const PRODUCT_ROUTE = '/products/:slug';

const routes = {
  '/': {
    component: Home,
    title: 'KAE Engineering | Инженерные решения нового поколения',
    bodyClass: 'bg-background text-on-background font-body-md overflow-x-hidden',
  },
  '/products': {
    component: Products,
    title: 'KAE Engineering | Наша продукция',
    bodyClass: 'font-body-md overflow-x-hidden',
  },
  [PRODUCT_ROUTE]: {
    component: ProductDetails,
    title: 'KAE Engineering | Детали товара',
    bodyClass: 'bg-background text-on-background font-body-md overflow-x-hidden',
  },
  '/about': {
    component: About,
    title: 'KAE Engineering | О компании',
    bodyClass: 'bg-background text-on-background font-body-md overflow-x-hidden',
  },
  '/contacts': {
    component: Contacts,
    title: 'Контакты | KAE Engineering',
    bodyClass: 'bg-background text-on-background font-body-md overflow-x-hidden',
  },
};

const routeAliases = {
  '/index.html': '/',
  '/products.html': '/products',
  '/about.html': '/about',
  '/contacts.html': '/contacts',
  // Страница товара раньше была одна и без параметра. Старые ссылки
  // возвращаем в каталог, чтобы они не вели в никуда.
  '/product-details': '/products',
  '/product-details.html': '/products',
};

/**
 * Разбирает адрес в маршрут и его параметры.
 * Неизвестные адреса ведут на главную — поведение как было.
 */
function resolveRoute(pathname) {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const aliased = routeAliases[cleanPath] ?? cleanPath;

  const productMatch = aliased.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    return { path: PRODUCT_ROUTE, params: { slug: decodeURIComponent(productMatch[1]) } };
  }

  return { path: routes[aliased] ? aliased : '/', params: {} };
}

export default function PublicSite() {
  const [location, setLocation] = useState(() => resolveRoute(window.location.pathname));
  const route = routes[location.path] ?? routes['/'];
  const Page = route.component;

  usePageEffects(location.path + (location.params.slug ?? ''));

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.lang = 'ru';
    document.body.className = route.bodyClass;
    document.title = route.title;
  }, [route]);

  // Страница товара уточняет заголовок сама, когда загрузит данные,
  // поэтому визиты считаем по адресу.
  useEffect(() => {
    track({ type: 'visit', path: window.location.pathname, referrer: document.referrer });
  }, [location.path, location.params.slug]);

  useEffect(() => {
    const handlePopState = () => {
      setLocation(resolveRoute(window.location.pathname));
      window.scrollTo({ top: 0 });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleClick = (event) => {
    // Не перехватываем клики со служебными клавишами и не-левой кнопкой —
    // «открыть в новой вкладке» должно работать как обычно.
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest('a');
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return;

    // Загруженные файлы (PDF документации) отдаёт сервер, а не роутер.
    if (url.pathname.startsWith('/uploads/')) return;

    const next = resolveRoute(url.pathname);
    const target = url.pathname.replace(/\/+$/, '') || '/';

    // Неизвестный адрес не перехватываем — пусть браузер покажет 404 сервера.
    if (next.path === '/' && target !== '/' && !routeAliases[target]) return;

    event.preventDefault();
    window.history.pushState({}, '', url.pathname);
    setLocation(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <div onClick={handleClick}>
      <Page {...location.params} />
    </div>
  );
}
