import { useState } from 'react';
import { adminApi } from '../api.js';
import { IconButton } from './ui.jsx';

/** Разделы меню. minRole — минимальная роль, при которой пункт виден. */
export const SECTIONS = [
  { path: '/admin', label: 'Дашборд', icon: 'dashboard', exact: true },
  { path: '/admin/products', label: 'Товары', icon: 'inventory_2' },
  { path: '/admin/categories', label: 'Категории', icon: 'category' },
  { path: '/admin/documents', label: 'Документация', icon: 'picture_as_pdf' },
  { path: '/admin/media', label: 'Медиа', icon: 'perm_media' },
  { path: '/admin/texts', label: 'Тексты', icon: 'edit_note' },
  { path: '/admin/team', label: 'Команда', icon: 'groups' },
  { path: '/admin/requests', label: 'Заявки', icon: 'mark_email_unread' },
  { path: '/admin/users', label: 'Пользователи', icon: 'manage_accounts', minRole: 'admin' },
];

const ROLE_LEVEL = { viewer: 1, editor: 2, admin: 3 };
const ROLE_LABEL = { admin: 'Администратор', editor: 'Редактор', viewer: 'Наблюдатель' };

export function AdminLayout({ user, path, navigate, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const visible = SECTIONS.filter(
    (section) => !section.minRole || ROLE_LEVEL[user.role] >= ROLE_LEVEL[section.minRole],
  );

  const isActive = (section) =>
    section.exact ? path === section.path : path === section.path || path.startsWith(section.path + '/');

  const logout = async () => {
    await adminApi.logout().catch(() => {});
    onLogout();
  };

  const navigation = (
    <nav className="flex flex-col gap-0.5">
      {visible.map((section) => (
        <a
          key={section.path}
          href={section.path}
          onClick={() => setMenuOpen(false)}
          className={`flex items-center gap-3 rounded-sm px-3 py-2.5 font-label-md text-label-md transition-all ${
            isActive(section)
              ? 'bg-primary/10 text-primary'
              : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
          {section.label}
        </a>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* Боковое меню — десктоп */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-outline-variant/60 bg-surface-container-lowest lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-outline-variant/60 px-5">
          <img src="/kae-logo.svg" alt="KAE" className="h-7 object-contain" />
          <span className="font-label-sm text-[10px] uppercase tracking-[0.2em] text-outline">Admin</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3">{navigation}</div>

        <div className="border-t border-outline-variant/60 p-3">
          <a
            href="/"
            className="flex items-center gap-3 rounded-sm px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-all hover:bg-white/5 hover:text-primary"
          >
            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
            Открыть сайт
          </a>
        </div>
      </aside>

      {/* Меню — мобильные */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)}></div>
          <div className="relative flex h-full w-64 flex-col border-r border-outline-variant bg-surface">
            <div className="flex h-16 items-center justify-between border-b border-outline-variant/60 px-4">
              <img src="/kae-logo.svg" alt="KAE" className="h-7 object-contain" />
              <IconButton icon="close" title="Закрыть" onClick={() => setMenuOpen(false)} />
            </div>
            <div className="flex-1 overflow-y-auto p-3">{navigation}</div>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Верхняя панель */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-outline-variant/60 bg-surface/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-2">
            <IconButton icon="menu" title="Меню" className="lg:hidden" onClick={() => setMenuOpen(true)} />
            <span className="font-label-sm text-[11px] uppercase tracking-widest text-outline">
              {visible.find(isActive)?.label ?? 'Панель управления'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="font-label-md text-label-md leading-tight text-white">{user.name}</div>
              <div className="font-label-sm text-[10px] uppercase tracking-wider text-outline">
                {ROLE_LABEL[user.role]}
              </div>
            </div>
            <IconButton icon="logout" title="Выйти" onClick={logout} />
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
