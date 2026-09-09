import { NAV_LINKS } from './navigation.js';
import { useT } from '../../lib/i18n.jsx';
import { Icon, LangSwitch } from '../ui/index.js';

/**
 * Верхний борт ящика.
 *
 * Шапка не висит поверх страницы и не имеет своего фона. Прежняя была
 * `fixed` со стеклом, размытием и нижней рамкой — то есть отдельной
 * плашкой, положенной на сайт; между ней и страницей был шов, и он был
 * виден. Здесь земля непрерывна: шапка написана прямо на том же полотне
 * и уезжает вместе с ним.
 *
 * Отступ сверху у `main`, которым страницы компенсировали `fixed`,
 * снимается правилом `.kns-world main` в styles.css.
 *
 * Активный пункт помечен не цветом, а хайрлайном под ним: акцент в кадре
 * ровно один, и он принадлежит целевому действию самой страницы.
 *
 * Акцентной кнопки «Связаться с нами» в шапке больше нет. Она стояла на
 * каждой странице и делила кадр с их собственным целевым действием — на
 * главной с «Номенклатурой», в каталоге с переходом в позицию, — то есть
 * ровно то правило и нарушала. Переход никуда не делся: на широких экранах
 * он в меню («Контакты»), на узких — в выдвижном меню отдельной кнопкой.
 */
export function Header({ active }) {
  const t = useT();

  return (
    <header className="relative w-full">
      <div className="mx-auto flex max-w-container-max flex-wrap items-center justify-between gap-x-6 gap-y-4 px-margin-mobile pt-6 pb-5 md:px-margin-desktop md:pt-7">
        <a href="/" className="flex shrink-0 items-center gap-3 sm:gap-4">
          {/*
            Высота обязательна: сам файл — 1632x714, и без неё браузер
            растягивает логотип по ширине контейнера, а высоту считает
            пропорционально. Шапка вырастала до полутысячи пикселей.
          */}
          <img src="/kae-logo.svg" alt="KAE Engineering" className="h-7 w-auto object-contain sm:h-8" />
          <span aria-hidden="true" className="h-6 w-px bg-hairline sm:h-7"></span>
          <img src="/aselsan-emblem.svg" alt="Aselsan" className="h-6 object-contain sm:h-7" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label={t('nav.home')}>
          {NAV_LINKS.map(({ path, labelKey }) => (
            <a
              key={path}
              href={path}
              aria-current={path === active ? 'page' : undefined}
              className={
                path === active
                  ? 'border-b border-hairline pb-1 font-label-sm text-label-sm uppercase text-stencil'
                  : 'border-b border-transparent pb-1 font-label-sm text-label-sm uppercase text-ink-dim transition-colors duration-200 hover:border-hairline hover:text-stencil'
              }
            >
              {t(labelKey)}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 md:gap-5">
          {/* Переключатель языка виден всегда: он нужен ровно тем посетителям,
              которые не могут прочитать остальную шапку. В выдвижном меню он
              продублирован для тех, кто открыл именно его. */}
          <LangSwitch />

          <button
            id="menu-toggle"
            type="button"
            aria-label={t('common.menu_open')}
            aria-controls="mobile-drawer"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-stencil transition-colors duration-200 hover:text-ink lg:hidden"
          >
            <Icon name="menu" size="lg" />
          </button>
        </div>
      </div>

      {/* Разделитель мира — не смена фона и не линия во всю ширину, а редкий
          штрих: земля под шапкой чуть плотнее, чем под текстом. */}
      <div aria-hidden="true" className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="kns-dash w-full"></div>
      </div>
    </header>
  );
}
