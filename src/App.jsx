import { useEffect, useState } from 'react';

import About from './pages/About.jsx';
import Contacts from './pages/Contacts.jsx';
import Home from './pages/Home.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Products from './pages/Products.jsx';
import { usePageEffects } from './hooks/usePageEffects.js';

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
  '/product-details': {
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
  '/product-details.html': '/product-details',
  '/about.html': '/about',
  '/contacts.html': '/contacts',
};

const normalizePath = (path) => {
  const cleanPath = path.replace(/\/$/, '') || '/';
  return routeAliases[cleanPath] || (routes[cleanPath] ? cleanPath : '/');
};

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const route = routes[path] ?? routes['/'];
  const Page = route.component;

  usePageEffects(path);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.lang = 'ru';
    document.body.className = route.bodyClass;
    document.title = route.title;
  }, [route]);

  useEffect(() => {
    const handlePopState = () => {
      setPath(normalizePath(window.location.pathname));
      window.scrollTo({ top: 0 });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleClick = (event) => {
    const anchor = event.target.closest('a');
    if (!anchor) return;

    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return;

    const nextPath = normalizePath(url.pathname);
    if (!routes[nextPath]) return;

    event.preventDefault();
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0 });
  };

  return (
    <div onClick={handleClick}>
      <Page />
    </div>
  );
}
