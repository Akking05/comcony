import { Suspense, lazy, useEffect, useState } from 'react';
import PublicSite from './PublicSite.jsx';

// Код админки грузится отдельным чанком и не попадает в бандл публичного сайта.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

const isAdminPath = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/');

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
