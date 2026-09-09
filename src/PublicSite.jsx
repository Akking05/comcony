import { useCallback, useEffect, useRef, useState } from 'react';
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
import { localeOf, useLang } from './lib/i18n.jsx';
import { applyMeta } from './lib/seo.js';

const PRODUCT_ROUTE = '/products/:slug';
const NOT_FOUND_ROUTE = '/404';

/**
 * Заголовок и описание вкладки хранятся ключами словаря: они меняются
 * вместе с языком, а не только при переходе между страницами.
 * Точные значения страницы товара ставит сама, когда загрузит товар.
 */
const routes = {
  '/': {
    component: Home,
    titleKey: 'meta.home.title',
    descriptionKey: 'meta.home.description',
    nav: '/',
  },
  '/products': {
    component: Products,
    titleKey: 'meta.products.title',
    descriptionKey: 'meta.products.description',
    nav: '/products',
  },
  [PRODUCT_ROUTE]: {
    component: ProductDetails,
    titleKey: 'meta.product.title',
    descriptionKey: 'meta.product.description',
    nav: '/products',
  },
  '/about': {
    component: About,
    titleKey: 'meta.about.title',
    descriptionKey: 'meta.about.description',
    nav: '/about',
  },
  '/contacts': {
    component: Contacts,
    titleKey: 'meta.contacts.title',
    descriptionKey: 'meta.contacts.description',
    nav: '/contacts',
  },
  [NOT_FOUND_ROUTE]: {
    component: NotFound,
    titleKey: 'meta.404.title',
    descriptionKey: 'meta.404.description',
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
  const { lang, t } = useLang();
  const [location, setLocation] = useState(() => resolveRoute(window.location.pathname));
  const route = routes[location.path] ?? routes['/'];
  const Page = route.component;
  const lenisRef = useRef(null);

  const routeKey = location.path + (location.params.slug ?? '');

  /**
   * Перемотка наверх при смене страницы.
   *
   * Просить нужно саму Lenis, а не window.scrollTo. Lenis ведёт собственную
   * позицию прокрутки и на ближайшем кадре возвращает её на место — родная
   * перемотка отменяется, и новая страница открывается там же, где посетитель
   * закончил читать прежнюю, то есть снизу. Гонка кадров, поэтому «иногда».
   *
   * immediate — это скачок: без него Lenis промотает всю страницу вверх
   * на глазах у посетителя.
   */
  const scrollToTop = useCallback(() => {
    const lenis = lenisRef.current?.lenis;

    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0 });
  }, []);

  usePageEffects(routeKey);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    // Без `overflow-x-hidden`: утилита ломает `position: sticky` первого
    // экрана, делая body контейнером прокрутки. Горизонтальный вылет режет
    // `overflow-x: clip` в styles.css.
    document.body.className = 'bg-background text-on-background font-body-md';
  }, []);

  // lang в зависимостях: при смене языка вкладка и описание должны
  // перезаписаться, даже если маршрут остался прежним.
  // Атрибут lang у <html> ставит сам LanguageProvider.
  useEffect(() => {
    // Страница товара уточнит заголовок и описание сама, когда загрузит
    // данные. Здесь — значения маршрута, чтобы вкладка не оставалась
    // от предыдущей страницы, пока идёт запрос.
    applyMeta({
      title: t(route.titleKey),
      description: t(route.descriptionKey),
      locale: localeOf(lang),
      noindex: route.noindex,
    });
  }, [route, routeKey, lang, t]);

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
    <ReactLenis root ref={lenisRef} options={{ lerp: 0.08 }}>
      {/* Фон вне анимируемого контейнера: transform на нём сделал бы его
          системой отсчёта для position: fixed, и фон поехал бы вместе со
          страницей. */}
      <PageBackground />

      {/* `kns-world` — само полотно земли: на нём лежит зерно доски,
          разрежающееся к подвалу. Шапка, страница и подвал — его прямые
          дети и своего фона не имеют, поэтому шва между ними нет. */}
      <div className="kns-world" onClick={handleClick}>
        <Header active={route.nav} />
        <MobileDrawer active={route.nav} />

        {/* Прокрутка наверх — после того как прежняя страница исчезла,
            иначе перемотка видна во время затухания. */}
        <AnimatePresence mode="wait" onExitComplete={scrollToTop}>
          <motion.div key={routeKey} {...TRANSITION}>
            <Page {...location.params} />
          </motion.div>
        </AnimatePresence>

        <Footer />
      </div>
    </ReactLenis>
  );
}
