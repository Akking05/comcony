import { useCallback, useEffect, useState } from 'react';
import { adminApi } from './api.js';
import { AdminLayout } from './components/AdminLayout.jsx';
import { Login } from './components/Login.jsx';
import { Spinner, ToastProvider } from './components/ui.jsx';

import Dashboard from './pages/Dashboard.jsx';
import ProductsList from './pages/ProductsList.jsx';
import ProductEdit from './pages/ProductEdit.jsx';
import Categories from './pages/Categories.jsx';
import Documents from './pages/Documents.jsx';
import Media from './pages/Media.jsx';
import Texts from './pages/Texts.jsx';
import Team from './pages/Team.jsx';
import Requests from './pages/Requests.jsx';
import Users from './pages/Users.jsx';

/** Разбор адреса админки в страницу и её параметры. */
function resolve(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/admin';

  const productEdit = path.match(/^\/admin\/products\/(new|\d+)$/);
  if (productEdit) {
    return { page: ProductEdit, props: { id: productEdit[1] === 'new' ? null : Number(productEdit[1]) } };
  }

  const pages = {
    '/admin': Dashboard,
    '/admin/products': ProductsList,
    '/admin/categories': Categories,
    '/admin/documents': Documents,
    '/admin/media': Media,
    '/admin/texts': Texts,
    '/admin/team': Team,
    '/admin/requests': Requests,
    '/admin/users': Users,
  };

  return { page: pages[path] ?? Dashboard, props: {} };
}

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [path, setPath] = useState(() => window.location.pathname.replace(/\/+$/, '') || '/admin');

  // Проверяем существующую сессию по куке.
  useEffect(() => {
    adminApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    document.title = 'KAE Engineering | Панель управления';
    document.documentElement.classList.add('dark');
    document.body.className = 'bg-background text-on-background font-body-md';
  }, []);

  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to);
    setPath(to.replace(/\/+$/, '') || '/admin');
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname.replace(/\/+$/, '') || '/admin');

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Внутренние ссылки админки перехватываем, внешние отдаём браузеру.
  const onClick = (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest('a');
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/admin')) return;

    event.preventDefault();
    navigate(url.pathname);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner label="Проверяем сессию…" />
      </div>
    );
  }

  if (!user) return <Login onSuccess={setUser} />;

  const { page: Page, props } = resolve(path);

  return (
    <ToastProvider>
      <div onClick={onClick}>
        <AdminLayout user={user} path={path} navigate={navigate} onLogout={() => setUser(null)}>
          <Page {...props} user={user} navigate={navigate} />
        </AdminLayout>
      </div>
    </ToastProvider>
  );
}
