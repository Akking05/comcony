import { useT } from '../../lib/i18n.jsx';
import { LangSwitch } from '../ui/index.js';

/**
 * Нижняя кромка ящика.
 *
 * Шва между main и подвалом нет: у подвала нет ни своего фона, ни рамки
 * во всю ширину — земля просто разрежается. Прежний подвал был отдельной
 * плашкой (`bg-surface-container-lowest`, светящаяся линия по верху,
 * вторая сетка поверх), и граница между сайтом и подвалом читалась как
 * стык двух макетов.
 *
 * Соцсети отсюда убраны: у компании их нет, а три ссылки на `#` — это
 * не заглушка, а обещание. Кнопка «Терминал» тоже: она ничего не
 * открывала.
 */
export function Footer() {
  const t = useT();

  return (
    <footer className="relative w-full">
      {/* Разрежение земли: шаг штриха расходится, краска становится реже. */}
      <div
        aria-hidden="true"
        className="kns-thinning mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop"
      />

      <div className="relative mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col gap-stack-lg pt-stack-xl pb-stack-lg lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <div className="flex items-center gap-4">
              {/* Та же причина, что в шапке: без высоты файл 1632x714 рвёт подвал. */}
              <img src="/kae-logo.svg" alt="KAE Logo" className="h-8 w-auto object-contain md:h-9" />
              <span aria-hidden="true" className="h-6 w-px bg-hairline" />
              <img src="/aselsan-yeni-logo.svg" alt="Aselsan" className="h-8 object-contain md:h-9" />
            </div>
            <p className="font-body-sm text-body-sm text-ink-dim">{t('footer.about')}</p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <span className="kns-mark">{t('common.language')}</span>
            <LangSwitch size="md" />
          </div>
        </div>

        <div aria-hidden="true" className="kns-dash w-full" />

        <div className="flex flex-col-reverse items-start justify-between gap-2 py-stack-md sm:flex-row sm:items-center">
          <p className="kns-mark">{t('footer.copyright')}</p>
          <p className="kns-mark text-stencil">{t('common.tagline')}</p>
        </div>
      </div>
    </footer>
  );
}
