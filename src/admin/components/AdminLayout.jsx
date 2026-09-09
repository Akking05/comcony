import { useState } from 'react';
import { adminApi } from '../api.js';
import { IconButton } from './ui.jsx';

/*
  Рама панели: боковое меню, верхняя строка и рабочее поле.

  Раскладка привычная нарочно — слева разделы, сверху где я и кто я, справа
  выход. Знакомая рама здесь ценнее выразительной: в панель приходят с
  делом, и каждый её сюрприз оплачивается временем редактора.

  Активный раздел помечен не заливкой акцентом, а хайрлайном слева и
  плотностью краски. Так на экране, где уже есть кнопка действия, не
  загорается вторая синяя точка.
*/

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
    <nav className="flex flex-col">
      {visible.map((section) => {
        const active = isActive(section);

        return (
          <a
            key={section.path}
            href={section.path}
            aria-current={active ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 border-l-2 px-3 py-2.5 font-label-md text-label-md uppercase transition-colors duration-150 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
              active
                ? 'kns-roll border-l-stencil text-ink'
                : 'border-l-transparent text-ink-dim hover:bg-stencil/6 hover:text-ink'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
            {section.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <div className="kae-admin min-h-screen">
      {/* Боковое меню — десктоп */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-hairline bg-ground-deep lg:flex">
        <div className="flex h-14 items-center gap-3 border-b border-hairline px-5">
          <img src="/kae-logo.svg" alt="KAE" className="h-7 object-contain" />
          <span className="font-label-2xs text-label-2xs uppercase text-ink-quiet">Панель</span>
        </div>

        <div className="flex-1 overflow-y-auto py-3">{navigation}</div>

        <div className="border-t border-hairline p-3">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 font-label-md text-label-md uppercase text-ink-dim transition-colors duration-150 hover:text-ink"
          >
            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
            Открыть сайт
          </a>
        </div>
      </aside>

      {/* Меню — мобильные */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ground-deep/85" onClick={() => setMenuOpen(false)}></div>
          <div className="relative flex h-full w-64 flex-col border-r border-hairline bg-ground-deep">
            <div className="flex h-14 items-center justify-between border-b border-hairline px-4">
              <img src="/kae-logo.svg" alt="KAE" className="h-7 object-contain" />
              <IconButton icon="close" title="Закрыть" onClick={() => setMenuOpen(false)} />
            </div>
            <div className="flex-1 overflow-y-auto py-3">{navigation}</div>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Верхняя строка: где я и кто я. Непрозрачная — под ней прокручивается
            таблица, и полупрозрачная полоса читалась бы поверх её строк. */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-hairline bg-ground px-4 md:px-6">
          <div className="flex items-center gap-2">
            <IconButton icon="menu" title="Меню" className="lg:hidden" onClick={() => setMenuOpen(true)} />
            <span className="font-label-md text-label-md uppercase text-ink-quiet">
              {visible.find(isActive)?.label ?? 'Панель управления'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="font-body-md text-[15px] leading-tight text-ink">{user.name}</div>
              <div className="font-label-2xs text-label-2xs uppercase text-ink-quiet">
                {ROLE_LABEL[user.role]}
              </div>
            </div>
            <IconButton icon="logout" title="Выйти" onClick={logout} />
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
