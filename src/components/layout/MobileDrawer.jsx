import { NAV_LINKS } from './navigation.js';

export function MobileDrawer({ active }) {
  return (
    <div id="mobile-drawer" className="closed pointer-events-none fixed inset-0 z-[100] flex justify-end">
      <div
        id="drawer-overlay"
        className="absolute inset-0 bg-background/80 opacity-0 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      <div className="drawer-content relative flex h-full w-[85vw] max-w-sm flex-col border-l border-white/10 bg-surface/95 backdrop-blur-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-3">
          <img src="/kae-logo.svg" alt="KAE Engineering" className="h-8 object-contain" />
          <button
            id="menu-close"
            type="button"
            aria-label="Закрыть меню"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-primary transition-colors hover:text-white"
          >
            <span className="material-symbols-outlined text-[26px]">close</span>
          </button>
        </div>

        {/* Длинное меню на маленьком экране должно прокручиваться */}
        <nav className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="flex flex-col">
            {NAV_LINKS.map(({ path, label }) => (
              <li key={path}>
                <a
                  href={path}
                  className={`flex items-center justify-between border-b border-white/5 py-4 font-label-lg uppercase tracking-widest transition-colors duration-300 ${
                    path === active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {label}
                  {path === active && <span className="active-glow"></span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Кнопка, убранная из шапки на узких экранах */}
        <div className="shrink-0 border-t border-white/10 px-6 py-6">
          <a
            href="/contacts"
            className="primary-glow block rounded-sm bg-primary-container px-6 py-3.5 text-center font-label-md text-label-md font-bold uppercase tracking-widest text-on-primary-container"
          >
            Связаться с нами
          </a>

          <div className="mt-5 flex items-center justify-center gap-3 opacity-60">
            <img src="/aselsan-emblem.svg" alt="Aselsan" className="h-7 object-contain" />
            <span className="font-label-sm text-[10px] uppercase tracking-[0.2em] text-outline">Ready for tomorrow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
