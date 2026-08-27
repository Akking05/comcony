import { NAV_LINKS } from './navigation.js';

export function Header({ active }) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-surface/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-container-max items-center justify-between gap-3 px-margin-mobile py-3 md:px-margin-desktop md:py-4">
        {/* Логотипы: на узких экранах мельче и без лишних отступов */}
        <a href="/" className="flex shrink-0 items-center gap-2.5 sm:gap-4">
          <img src="/kae-logo.svg" alt="KAE Engineering" className="h-8 object-contain sm:h-10 md:h-12" />
          <span aria-hidden="true" className="h-6 w-px bg-white/10 sm:h-8"></span>
          <img src="/aselsan-emblem.svg" alt="Aselsan" className="h-6 object-contain sm:h-8 md:h-9" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map(({ path, label }) => (
            <a
              key={path}
              href={path}
              className={
                path === active
                  ? 'border-b-2 border-primary pb-1 font-label-md text-label-md font-bold text-primary'
                  : 'font-label-md text-label-md text-on-surface-variant transition-colors duration-300 hover:text-primary'
              }
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          {/* Текстовая кнопка появляется только когда для неё есть место.
              На мобильном тот же переход живёт в выдвижном меню. */}
          <a
            href="/contacts"
            className="primary-glow hidden rounded-sm bg-primary-container px-6 py-2 font-label-md text-label-md font-bold text-on-primary-container transition-transform duration-200 hover:scale-95 md:inline-block"
          >
            Связаться с нами
          </a>

          <button
            id="menu-toggle"
            type="button"
            aria-label="Открыть меню"
            aria-controls="mobile-drawer"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-primary lg:hidden"
          >
            <span className="material-symbols-outlined text-[28px]">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
