import { NAV_LINKS } from './navigation.js';

export function Header({ active }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/30 backdrop-blur-xl border-b border-white/10">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <div className="flex items-center gap-4">
          <img src="/kae-logo.svg" alt="KAE Logo" className="h-10 md:h-12 object-contain" />
          <div className="w-px h-8 bg-white/10" />
          <img src="/aselsan-emblem.svg" alt="Aselsan" className="h-6 md:h-7 object-contain" />
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(({ path, label }) => (
            <a
              key={path}
              href={path}
              className={
                path === active
                  ? 'text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md'
                  : 'text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300'
              }
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a
            href="/contacts"
            className="inline-block bg-primary-container text-on-primary-container px-6 py-2 rounded-sm font-label-md text-label-md font-bold hover:scale-95 transition-transform duration-200 primary-glow"
          >
            Связаться с нами
          </a>
          <button id="menu-toggle" className="lg:hidden text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}
