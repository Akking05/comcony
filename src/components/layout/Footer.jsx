const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Twitter', href: '#' },
  { label: 'GitHub', href: '#' },
];

export function Footer() {
  return (
    <footer className="relative z-10 w-full overflow-hidden border-t border-outline-variant/60 bg-surface-container-lowest">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-[0.04]" />

      <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col items-center gap-stack-lg py-stack-xl text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center gap-4 lg:max-w-xs lg:items-start">
            <div className="flex items-center gap-4">
              <img src="/kae-logo.svg" alt="KAE Logo" className="h-9 md:h-10 object-contain" />
              <span aria-hidden="true" className="h-6 w-px bg-white/10" />
              <img src="/aselsan-yeni-logo.svg" alt="Aselsan" className="h-9 md:h-12 object-contain" />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Инженерные решения нового поколения для промышленности, безопасности и будущих проектов.
            </p>
          </div>

          {/* Connect */}
          <div className="flex flex-col items-center gap-6 lg:items-end">
            <div className="flex flex-col items-center gap-4 lg:items-end">
              <span className="font-label-sm text-[10px] text-outline uppercase tracking-[0.25em]">На связи</span>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 lg:justify-end">
                {SOCIAL_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="group relative font-label-sm text-label-sm text-on-surface-variant outline-none transition-colors duration-300 hover:text-secondary focus-visible:text-secondary"
                  >
                    {label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-secondary transition-all duration-300 group-hover:w-full group-focus-visible:w-full" />
                  </a>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                aria-label="Сменить язык"
                title="Язык"
                className="glass-panel flex h-10 w-10 items-center justify-center rounded-sm text-primary outline-none transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_16px_rgba(0,209,255,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60"
              >
                <span className="material-symbols-outlined text-xl">language</span>
              </button>
              <button
                type="button"
                aria-label="Системный терминал"
                title="Терминал"
                className="glass-panel flex h-10 w-10 items-center justify-center rounded-sm text-primary outline-none transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_16px_rgba(0,209,255,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60"
              >
                <span className="material-symbols-outlined text-xl">terminal</span>
              </button>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-outline-variant/40" />

        <div className="flex flex-col-reverse items-center justify-between gap-2 py-stack-sm sm:flex-row">
          <p className="font-label-sm text-[11px] tracking-wide text-on-surface-variant/70">
            © 2024 KAE Engineering.
          </p>
          <p className="font-label-sm text-[10px] uppercase tracking-[0.3em] text-primary/70">
            Ready for tomorrow
          </p>
        </div>
      </div>
    </footer>
  );
}
