import { Suspense, lazy, useEffect, useState } from 'react';
import PublicSite from './PublicSite.jsx';
import { DEMO_MODE } from './lib/api.js';

// Код админки грузится отдельным чанком и не попадает в бандл публичного сайта.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

const isAdminPath = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/');

/**
 * На статическом хостинге бэкенда нет, поэтому вход в панель невозможен.
 * Показываем это честно, а не пустую форму, которая не сработает.
 */
function AdminUnavailable() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="tech-grid pointer-events-none fixed inset-0 opacity-40"></div>

      <div className="relative w-full max-w-md rounded-sm border border-outline-variant bg-surface/80 p-8 text-center backdrop-blur-xl">
        <img src="/kae-logo.svg" alt="KAE" className="mx-auto mb-6 h-10 object-contain" />

        <span className="material-symbols-outlined mb-3 text-4xl text-primary/60">cloud_off</span>

        <h1 className="mb-3 font-headline-md text-[18px] text-white">Панель недоступна</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Это витринная версия сайта: она показывает содержимое, но работает без сервера.
          Панель управления доступна на основном развёртывании.
        </p>

        <a
          href="/"
          className="mt-6 inline-block font-label-sm text-[11px] uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
        >
          Вернуться на сайт
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [admin, setAdmin] = useState(() => isAdminPath(window.location.pathname));

  // Переход между сайтом и админкой — обычная навигация браузера,
  // но History API (кнопки «назад»/«вперёд») тоже должен переключать режим.
  useEffect(() => {
    const onPopState = () => setAdmin(isAdminPath(window.location.pathname));

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (!admin) return <PublicSite />;

  if (DEMO_MODE) return <AdminUnavailable />;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-on-surface-variant">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
        </div>
      }
    >
      <AdminApp />
    </Suspense>
  );
}
