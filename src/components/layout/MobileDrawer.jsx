import { NAV_LINKS } from './navigation.js';
import { useT } from '../../lib/i18n.jsx';
import { Button, Icon, LangSwitch } from '../ui/index.js';

export function MobileDrawer({ active }) {
  const t = useT();

  return (
    <div id="mobile-drawer" className="closed pointer-events-none fixed inset-0 z-[100] flex justify-end">
      <div
        id="drawer-overlay"
        className="absolute inset-0 bg-ground-deep/90 opacity-0 transition-opacity duration-300"
      ></div>

      <div className="drawer-content relative flex h-full w-[85vw] max-w-sm flex-col border-l border-hairline bg-ground">
        <div className="flex shrink-0 items-center justify-between border-b border-hairline-soft px-6 py-3">
          <img src="/kae-logo.svg" alt="KAE Engineering" className="h-8 object-contain" />
          <button
            id="menu-close"
            type="button"
            aria-label={t('common.menu_close')}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-stencil transition-colors hover:text-ink"
          >
            <Icon name="close" size="lg" />
          </button>
        </div>

        {/* Длинное меню на маленьком экране должно прокручиваться */}
        <nav className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="flex flex-col">
            {NAV_LINKS.map(({ path, labelKey }) => (
              <li key={path}>
                <a
                  href={path}
                  className={`flex items-center justify-between border-b border-hairline-soft py-4 font-label-lg text-label-lg uppercase tracking-[0.14em] transition-colors duration-200 ${
                    path === active ? 'text-ink' : 'text-ink-dim hover:text-stencil'
                  }`}
                >
                  {t(labelKey)}
                  {path === active && <span className="active-glow"></span>}
                </a>
              </li>
            ))}
          </ul>

          {/* Переключатель — кнопки, а не ссылки: меню закрывается по клику
              на <a> (см. usePageEffects), и смена языка захлопывала бы его
              вместе с собой. */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-hairline-soft pt-6">
            <span className="kns-mark">
              {t('common.language')}
            </span>
            <LangSwitch size="md" />
          </div>
        </nav>

        {/* Кнопка, убранная из шапки на узких экранах */}
        <div className="shrink-0 border-t border-hairline-soft px-6 py-6">
          <Button href="/contacts" block>
            {t('common.contact')}
          </Button>

          <div className="mt-5 flex items-center justify-center gap-3">
            <img src="/aselsan-emblem.svg" alt="Aselsan" className="h-7 object-contain" />
            <span className="kns-mark">
              {t('common.tagline')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
