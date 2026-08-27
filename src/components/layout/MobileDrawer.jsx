import { NAV_LINKS } from './navigation.js';

export function MobileDrawer({ active }) {
  return (
    <div id="mobile-drawer" className="fixed inset-0 z-[100] closed pointer-events-none flex justify-end">
      <div id="drawer-overlay" className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>
      <div className="relative w-64 md:w-80 bg-surface border-l border-white/10 p-6 flex flex-col gap-8 h-full drawer-content bg-surface/90 backdrop-blur-xl">
        <div className="flex justify-between items-center">
          <img src="/kae-logo.svg" alt="KAE Logo" className="h-8 md:h-10 object-contain" />
          <button id="menu-close" className="text-primary hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <nav className="flex flex-col gap-6 mt-8">
          {NAV_LINKS.map(({ path, label }) => (
            <a
              key={path}
              href={path}
              className={
                path === active
                  ? 'text-primary font-label-lg transition-colors duration-300 uppercase tracking-widest border-b border-white/5 pb-4'
                  : 'text-on-surface-variant font-label-lg hover:text-primary transition-colors duration-300 uppercase tracking-widest border-b border-white/5 pb-4'
              }
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
