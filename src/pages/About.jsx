import { motion, useReducedMotion } from 'motion/react';

import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';
import { useLang } from '../lib/i18n.jsx';
import { rise } from '../lib/motion.js';
import { Reveal, STEP } from '../components/Reveal.jsx';
import { Placeholder } from '../components/home/parts.jsx';
import '../components/home/home.css';
import { Button, StatusBlock } from '../components/ui/index.js';

/*
  «О компании» — сопроводительный лист поставщика, а не рассказ о себе.

  Три правила, из которых собрана страница:

  · Фотографий нет ни одной. Портреты в базе — снимки с чужого хоста от
    прежнего каркаса, и подставлять их значило бы выдать заглушку за
    команду. Человек подаётся клеймом: инициалы трафаретом, номер по
    порядку, должность моноширинной. Это графика мира, а не аватар.
  · Ни одной цифры о компании. В базе остались `about.stat_1_value` = «250+»
    и `about.stat_2_value` = «15+» — выдумка прежнего наполнения. Данные не
    удалены, они по-прежнему правятся в админке; убран только показ, потому
    что придуманная цифра в тендерной закупке дороже пропуска.
  · Утверждения — только четыре подтверждённых (PRODUCT.md, «Positioning»).
    Они лежат в локалях рядом с теми же строками главной, а не пишутся заново.

  Что откуда: заголовок, вступление, миссия и призыв — тексты владельца
  сайта из базы (группа «О компании»); перечень людей — таблица
  `team_members`; подписи разделов и четыре утверждения — из локалей.
  Пустое значение в базе даёт заглушку `[ … ]`, а не пустое место.

  Структурные типы соседних разделов не повторяются: перечень утверждений →
  таблица «графа → значение» → поле клейм → полоса действия.
*/

/**
 * Конечное состояние появления. При `prefers-reduced-motion` оно же стоит
 * и до срабатывания наблюдателя: страница отрисована целиком, переходов нет.
 */
const SHOWN = { opacity: 1, y: 0 };

/** Ключи трёх граф миссии в таблице `texts`. */
const MISSION_KEYS = [1, 2, 3];

/** Порядковый номер по борту: 01, 02, 03… */
const numeral = (index) => String(index + 1).padStart(2, '0');

/**
 * Инициалы вместо портрета. Берём первые буквы первых двух слов имени —
 * этого хватает и кириллице, и латинице.
 */
function initialsOf(name) {
  return String(name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * Клеймо человека: рамка, инициалы трафаретом, номер и плотность краски.
 * Ячейки стоят вплотную и делят один хайрлайн — это перечень на листе,
 * а не карточки на подложке.
 */
function Mark({ member, index, still, positionLabel }) {
  return (
    <Reveal
      as="li"
      hidden={still ? SHOWN : undefined}
      delay={still ? 0 : Math.min(index, 8) * STEP}
      className="flex min-w-0 flex-col border-b border-r border-hairline-soft p-5 md:p-6"
    >
      <div className="kns-roll relative flex aspect-4/3 w-full items-center justify-center border border-hairline">
        <span aria-hidden="true" className="kns-display text-[clamp(34px,6vw,52px)] text-stencil">
          {initialsOf(member.name)}
        </span>

        <span
          aria-hidden="true"
          className="font-label-2xs text-label-2xs absolute left-2 top-2 text-ink-quiet"
        >
          {numeral(index)}
        </span>
      </div>

      <h3 className="mt-4 font-title-sm text-title-sm text-ink">{member.name}</h3>

      <p className="font-label-2xs text-label-2xs mt-2 uppercase text-ink-dim">
        {member.position || <Placeholder label={positionLabel} />}
      </p>

      {member.tags.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-2 pt-4">
          {member.tags.map((tag) => (
            <li
              key={tag}
              className="font-label-2xs text-label-2xs border border-hairline-soft px-2 py-1 uppercase text-ink-quiet"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </Reveal>
  );
}

/**
 * Поле клейм уходит в край экрана — так же, как поле номенклатуры в
 * каталоге. Поля страницы одинаковы на всех ширинах, поэтому одного
 * отрицательного отступа хватает.
 */
const FULL_BLEED = { marginInline: 'calc(var(--spacing-margin-mobile) * -1)' };

export default function About() {
  const { lang, t } = useLang();
  const still = useReducedMotion();

  /** Появление при монтировании. Выключенное движение — сразу конечный кадр. */
  const enter = (delay) => (still ? {} : rise(delay));

  // lang в зависимостях: смена языка — это новый запрос за текстами.
  const { data: texts } = useApi((signal) => api.texts(lang, signal), [lang]);
  const { data: team, error: teamError } = useApi((signal) => api.team(lang, signal), [lang]);

  const text = (key, fallback = '') => texts?.[key] ?? fallback;

  // Четыре утверждения, подтверждённые заказчиком. Ровно те же строки, что
  // на главной: расходиться им нельзя, поэтому и ключи те же.
  const claims = [
    t('home.partner_status'),
    t('home.claim_2'),
    t('home.claim_3'),
    t('home.claim_4'),
  ];

  const mission = MISSION_KEYS.map((index) => ({
    title: text(`about.mission_${index}_title`),
    line: text(`about.mission_${index}_text`),
  })).filter((row) => row.title);

  const intro = text('about.intro_1');
  const second = text('about.intro_2');

  return (
    <main className="relative z-10 mx-auto max-w-container-max px-margin-mobile pb-stack-xl md:px-margin-desktop">
      <header className="relative mb-stack-xl">
        {/* Клеймо по левому борту: маркировка ящика, а не надзаголовок. */}
        <span
          aria-hidden="true"
          className="font-label-sm text-label-sm absolute top-1 hidden uppercase text-ink-quiet xl:block"
          style={{
            writingMode: 'vertical-rl',
            letterSpacing: '0.34em',
            left: 'calc(var(--spacing-rail) * -1)',
          }}
        >
          {t('about.rail')}
        </span>

        <motion.h1
          {...enter(0.05)}
          className="max-w-3xl font-display-lg text-headline-lg-mobile text-ink md:text-display-lg"
        >
          {text('about.title', t('about.title'))}
        </motion.h1>

        <motion.p {...enter(0.16)} className="mt-stack-sm max-w-[62ch] font-body-lg text-body-md text-ink-dim">
          {intro || <Placeholder label={t('about.intro_placeholder')} />}
        </motion.p>
      </header>

      {/* 1. Основание: четыре подтверждённых утверждения, по одному в строке. */}
      <section aria-labelledby="about-claims" className="mb-stack-xl">
        <h2 id="about-claims" className="kns-display text-headline-md text-ink">
          {t('about.claims_title')}
        </h2>

        <ol className="mt-stack-md grid gap-0 border-t border-hairline">
          {claims.map((claim, index) => (
            <Reveal
              as="li"
              key={claim}
              hidden={still ? SHOWN : undefined}
              delay={still ? 0 : index * STEP}
              className="flex items-baseline gap-4 border-b border-hairline-soft py-4 md:gap-6"
            >
              <span aria-hidden="true" className="font-label-2xs text-label-2xs shrink-0 text-ink-quiet">
                {numeral(index)}
              </span>
              <span className="font-body-lg text-body-md text-ink">{claim}</span>
            </Reveal>
          ))}
        </ol>

        <p className="mt-stack-sm max-w-[58ch] font-body-md text-body-sm text-ink-dim">
          {t('home.status_statement')}
        </p>

        {second && (
          <p className="mt-stack-md max-w-[62ch] font-body-md text-body-md text-ink-dim">{second}</p>
        )}
      </section>

      {/* 2. Миссия: таблица «графа → значение». Тексты владельца сайта. */}
      {mission.length > 0 && (
        <section aria-labelledby="about-mission" className="mb-stack-xl">
          <h2 id="about-mission" className="kns-display text-headline-md text-ink">
            {text('about.mission_title', t('about.mission_title'))}
          </h2>

          <dl className="mt-stack-md border-t border-hairline">
            {mission.map((row, index) => (
              <Reveal
                key={row.title}
                hidden={still ? SHOWN : undefined}
                delay={still ? 0 : index * STEP}
                className="grid gap-1 border-b border-hairline-soft py-5 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-8"
              >
                <dt className="font-label-md text-label-md uppercase text-stencil">{row.title}</dt>
                <dd className="max-w-[62ch] font-body-md text-body-md text-ink-dim">
                  {row.line || <Placeholder label={t('about.value_placeholder')} />}
                </dd>
              </Reveal>
            ))}
          </dl>
        </section>
      )}

      {/* 3. Перечень людей. Снимков нет — клеймо с инициалами. */}
      <section aria-labelledby="about-team" className="mb-stack-xl">
        <h2 id="about-team" className="kns-display text-headline-md text-ink">
          {text('about.team_title', t('about.team_title'))}
        </h2>

        {text('about.team_intro') && (
          <p className="mt-stack-sm max-w-[58ch] font-body-md text-body-md text-ink-dim">
            {text('about.team_intro')}
          </p>
        )}

        {/* Контейнер каскада создаётся только вместе с данными: пустой,
            попавший в кадр, отработал бы вхолостую, и приехавшие позже
            клейма остались бы невидимыми. */}
        {team && team.length > 0 && (
          <ul
            style={FULL_BLEED}
            className="mt-stack-md grid grid-cols-2 border-t border-b border-hairline md:grid-cols-3 lg:grid-cols-4"
          >
            {team.map((member, index) => (
              <Mark
                key={`${member.name}-${index}`}
                member={member}
                index={index}
                still={still}
                positionLabel={t('about.position_placeholder')}
              />
            ))}
          </ul>
        )}

        {team && team.length === 0 && (
          <div className="mt-stack-md">
            <StatusBlock icon="person" title={t('about.team_empty_title')} text={t('about.team_empty_text')} />
          </div>
        )}

        {teamError && (
          <div className="mt-stack-md">
            <StatusBlock icon="cloud_off" title={t('products.error_title')} text={t('products.error_text')} />
          </div>
        )}
      </section>

      {/* 4. Единственное акцентное действие страницы. */}
      <section aria-labelledby="about-cta" className="kns-roll border-t border-hairline pt-stack-lg">
        <h2 id="about-cta" className="kns-display text-headline-md text-ink">
          {text('about.cta_title', t('common.contact'))}
        </h2>

        {text('about.cta_text') && (
          <p className="mt-stack-sm max-w-[58ch] font-body-md text-body-md text-ink-dim">
            {text('about.cta_text')}
          </p>
        )}

        <div className="mt-stack-md flex flex-wrap items-center gap-4">
          <Button href="/contacts" size="lg">
            {t('common.contact')}
          </Button>

          <Button href="/products" variant="ghost" iconEnd="arrow_forward">
            {t('common.catalog')}
          </Button>
        </div>
      </section>
    </main>
  );
}
