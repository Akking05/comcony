import { Suspense, lazy, useEffect, useState } from 'react';
import PublicSite from './PublicSite.jsx';
import { DEMO_MODE } from './lib/api.js';
import { useT } from './lib/i18n.jsx';
import { Icon } from './components/ui/Icon.jsx';

// Код админки грузится отдельным чанком и не попадает в бандл публичного сайта.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

const isAdminPath = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/');

/**
 * На статическом хостинге бэкенда нет, поэтому вход в панель невозможен.
 * Показываем это честно, а не пустую форму, которая не сработает.
 */
function AdminUnavailable() {
  const t = useT();

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-4">
      <div className="tech-grid pointer-events-none fixed inset-0 opacity-40"></div>

      <div className="relative w-full max-w-md rounded-sm border border-hairline bg-ground p-8 text-center">
        <img src="/kae-logo.svg" alt="KAE" className="mx-auto mb-6 h-10 object-contain" />

        <Icon name="cloud_off" size="3xl" className="mb-3 text-stencil-dim" />

        <h1 className="mb-3 font-title-sm text-title-sm text-ink">{t('admin_off.title')}</h1>
        <p className="font-body-md text-body-md text-ink-dim">{t('admin_off.text')}</p>

        <a
          href="/"
          className="mt-6 inline-block font-label-xs text-label-xs uppercase tracking-widest text-stencil transition-colors hover:text-ink"
        >
          {t('admin_off.back')}
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
        <div className="flex min-h-screen items-center justify-center bg-ground text-ink-dim">
          <span className="h-5 w-5 animate-spin rounded-full border border-hairline border-t-accent"></span>
        </div>
      }
    >
      <AdminApp />
    </Suspense>
  );
}
