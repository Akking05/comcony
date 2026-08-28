import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ReactLenis } from 'lenis/dist/lenis-react';

import About from './pages/About.jsx';
import Contacts from './pages/Contacts.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Products from './pages/Products.jsx';

import { Header } from './components/layout/Header.jsx';
import { MobileDrawer } from './components/layout/MobileDrawer.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { PageBackground } from './components/layout/PageBackground.jsx';

import { usePageEffects } from './hooks/usePageEffects.js';
import { track } from './lib/api.js';
import { applyMeta } from './lib/seo.js';

const PRODUCT_ROUTE = '/products/:slug';
const NOT_FOUND_ROUTE = '/404';

const routes = {
  '/': {
    component: Home,
    title: 'KAE Engineering | Инженерные решения нового поколения',
    description:
      'Инженерные решения и оборудование профессиональной радиосвязи для промышленности и инфраструктуры Казахстана.',
    nav: '/',
  },
  '/products': {
    component: Products,
    title: 'KAE Engineering | Наша продукция',
    description:
      'Каталог продукции KAE Engineering: радиостанции, ретрансляторы и инженерное оборудование с техническими характеристиками и документацией.',
    nav: '/products',
  },
  [PRODUCT_ROUTE]: {
    component: ProductDetails,
    title: 'KAE Engineering | Детали товара',
    // Точные заголовок и описание страница ставит сама, когда загрузит товар.
    description: 'Технические характеристики, применение и документация оборудования KAE Engineering.',
    nav: '/products',
  },
  '/about': {
    component: About,
    title: 'KAE Engineering | О компании',
    description:
      'О компании KAE Engineering: инженерная экспертиза, команда и подход к разработке технологических решений в Казахстане.',
    nav: '/about',
  },
  '/contacts': {
    component: Contacts,
    title: 'Контакты | KAE Engineering',
    description:
      'Контакты KAE Engineering: адрес офиса в Астане, телефон, почта и форма для запроса коммерческого предложения.',
    nav: '/contacts',
  },
  [NOT_FOUND_ROUTE]: {
    component: NotFound,
    title: 'Страница не найдена | KAE Engineering',
    description: 'Такого адреса на сайте нет.',
    nav: '',
    noindex: true,
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
 * Неизвестный адрес — это 404, а не главная: иначе посетитель не понимает,
 * что ошибся, а поисковик индексирует опечатки как копии главной.
 */
function resolveRoute(pathname) {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const aliased = routeAliases[cleanPath] ?? cleanPath;

  const productMatch = aliased.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    // Битая процентная кодировка не должна ронять роутер — такой slug
    // просто не найдётся в базе, и страница товара покажет «не найдено».
    let slug = productMatch[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {
      /* оставляем как есть */
    }

    return { path: PRODUCT_ROUTE, params: { slug } };
  }

  return { path: routes[aliased] ? aliased : NOT_FOUND_ROUTE, params: {} };
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

    // Страница товара уточнит заголовок и описание сама, когда загрузит
    // данные. Здесь — значения маршрута, чтобы вкладка не оставалась
    // от предыдущей страницы, пока идёт запрос.
    applyMeta({
      title: route.title,
      description: route.description,
      noindex: route.noindex,
    });
  }, [route, routeKey]);

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

    // Админка — отдельное приложение, её адреса роутер сайта не знает.
    // Без этой проверки ссылка на /admin показала бы страницу 404.
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) return;

    const target = url.pathname.replace(/\/+$/, '') || '/';

    // Ссылка на файл (кроме старых .html-адресов из routeAliases) —
    // тоже дело браузера, а не роутера.
    if (!routeAliases[target] && /\.[a-z0-9]{1,8}$/i.test(target)) return;

    const next = resolveRoute(url.pathname);

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
