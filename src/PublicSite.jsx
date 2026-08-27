import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ReactLenis } from 'lenis/dist/lenis-react';

import About from './pages/About.jsx';
import Contacts from './pages/Contacts.jsx';
import Home from './pages/Home.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Products from './pages/Products.jsx';

import { Header } from './components/layout/Header.jsx';
import { MobileDrawer } from './components/layout/MobileDrawer.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { PageBackground } from './components/layout/PageBackground.jsx';

import { usePageEffects } from './hooks/usePageEffects.js';
import { track } from './lib/api.js';

const PRODUCT_ROUTE = '/products/:slug';

const routes = {
  '/': {
    component: Home,
    title: 'KAE Engineering | Инженерные решения нового поколения',
    nav: '/',
  },
  '/products': {
    component: Products,
    title: 'KAE Engineering | Наша продукция',
    nav: '/products',
  },
  [PRODUCT_ROUTE]: {
    component: ProductDetails,
    title: 'KAE Engineering | Детали товара',
    nav: '/products',
  },
  '/about': {
    component: About,
    title: 'KAE Engineering | О компании',
    nav: '/about',
  },
  '/contacts': {
    component: Contacts,
    title: 'Контакты | KAE Engineering',
    nav: '/contacts',
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

/** Плавность на грани заметности: содержимое подменяется, обвязка стоит. */
const TRANSITION = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] },
};

export default function PublicSite() {
  const [location, setLocation] = useState(() => resolveRoute(window.location.pathname));
  const route = routes[location.path] ?? routes['/'];
  const Page = route.component;

  const routeKey = location.path + (location.params.slug ?? '');

  usePageEffects(routeKey);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.lang = 'ru';
    document.body.className = 'bg-background text-on-background font-body-md overflow-x-hidden';
    document.title = route.title;
  }, [route]);

  useEffect(() => {
    track({ type: 'visit', path: window.location.pathname, referrer: document.referrer });
  }, [routeKey]);

  useEffect(() => {
    const handlePopState = () => setLocation(resolveRoute(window.location.pathname));

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

    // Якорь на текущей странице — просто прокрутка, без смены маршрута.
    if (url.pathname === window.location.pathname && url.hash) {
      document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    window.history.pushState({}, '', url.pathname + url.search);
    setLocation(next);
  };

  return (
    <ReactLenis root options={{ lerp: 0.08 }}>
      {/* Фон вне анимируемого контейнера: transform на нём сделал бы его
          системой отсчёта для position: fixed, и фон поехал бы вместе со
          страницей. */}
      <PageBackground />

      <div onClick={handleClick}>
        <Header active={route.nav} />
        <MobileDrawer active={route.nav} />

        {/* Прокрутка наверх — после того как прежняя страница исчезла,
            иначе перемотка видна во время затухания. */}
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0 })}>
          <motion.div key={routeKey} {...TRANSITION}>
            <Page {...location.params} />
          </motion.div>
        </AnimatePresence>

        <Footer />
      </div>
    </ReactLenis>
  );
}
