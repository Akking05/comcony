import { motion } from 'motion/react';
import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';
import { EASE, rise } from '../lib/motion.js';
import { FADE, Reveal, STEP } from '../components/Reveal.jsx';

const MISSION_CARDS = [
  { number: '01', icon: 'architecture', accent: 'primary-fixed' },
  { number: '02', icon: 'diversity_3', accent: 'secondary' },
  { number: '03', icon: 'verified_user', accent: 'primary-fixed' },
];

function MissionCard({ card, index, title, description }) {
  const isSecondary = card.accent === 'secondary';

  return (
    <Reveal
      delay={index * STEP}
      className={`glass-panel group relative p-8 transition-all duration-500 ${
        isSecondary ? 'hover:border-secondary/50' : 'hover:border-primary-fixed/50'
      }`}
    >
      <div className="absolute -right-4 -top-4 font-label-mono text-6xl font-bold italic text-outline-variant/20 transition-colors group-hover:text-outline-variant/30">
        {card.number}
      </div>

      <div
        className={`mb-6 flex h-12 w-12 items-center justify-center border transition-transform group-hover:scale-110 ${
          isSecondary
            ? 'border-secondary/30 bg-secondary/10 text-secondary'
            : 'border-primary-fixed/30 bg-primary-fixed/10 text-primary-fixed'
        }`}
      >
        <span className="material-symbols-outlined">{card.icon}</span>
      </div>

      <h3 className="mb-4 font-headline-md text-[24px] text-white">{title}</h3>
      <p className="font-body-md text-on-surface-variant">{description}</p>
    </Reveal>
  );
}

function TeamMember({ member, index }) {
  return (
    <Reveal delay={index * STEP} className="group">
      <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-sm bg-surface-container-high">
        {member.photo ? (
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url('${member.photo}')` }}
          ></div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-outline/30">
            <span className="material-symbols-outlined text-5xl">person</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>

        {member.tags.length > 0 && (
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {member.tags.map((tag, tagIndex) => (
              <span
                key={tag}
                className={`border bg-surface/80 px-2 py-1 font-label-mono text-[10px] uppercase backdrop-blur ${
                  tagIndex === 0 ? 'border-primary-fixed/30 text-primary-fixed' : 'border-secondary/30 text-secondary'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <h4 className="font-headline-md text-[18px] text-white">{member.name}</h4>
      <p className="mt-1 font-label-mono text-[12px] uppercase text-outline">{member.position}</p>
    </Reveal>
  );
}

function Stat({ value, label, accent, index = 0 }) {
  return (
    <Reveal
      delay={index * STEP}
      className={`glass-panel border-l-4 p-6 ${accent === 'secondary' ? 'border-l-secondary' : 'border-l-primary-fixed'}`}
    >
      <div
        className={`mb-1 font-label-mono text-[32px] font-bold ${
          accent === 'secondary' ? 'text-secondary' : 'text-primary-fixed'
        }`}
      >
        {value}
      </div>
      <div className="font-label-mono text-[10px] uppercase text-outline">{label}</div>
    </Reveal>
  );
}

export default function About() {
  const { data: texts } = useApi((signal) => api.texts(signal));
  const { data: team } = useApi((signal) => api.team(signal));

  const text = (key, fallback = '') => texts?.[key] ?? fallback;

  return (
    <main className="pt-20 md:pt-24">
      {/* Вступление */}
      <section className="relative z-10 mx-auto max-w-container-max px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">
          <motion.div {...rise(0.05)} className="text-center md:col-span-5 md:text-left">
            <span className="mb-4 block font-label-mono text-label-mono uppercase tracking-widest text-primary-fixed">
              {text('about.eyebrow')}
            </span>
            <h1 className="mb-6 font-headline-lg-mobile text-headline-lg-mobile uppercase text-white md:font-display-md md:text-display-md">
              {text('about.title', 'О компании')}
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="mx-auto mb-8 h-[2px] w-16 origin-left bg-primary-fixed md:mx-0"
            ></motion.div>
          </motion.div>

          <motion.div {...rise(0.2)} className="space-y-6 md:col-span-7">
            <p className="font-body-lg text-body-lg text-on-surface">{text('about.intro_1')}</p>
            <p className="font-body-md text-body-md text-on-surface-variant">{text('about.intro_2')}</p>

            <div className="mt-12 grid grid-cols-1 gap-4 xs:grid-cols-2">
              <Stat value={text('about.stat_1_value')} label={text('about.stat_1_label')} />
              <Stat value={text('about.stat_2_value')} label={text('about.stat_2_label')} accent="secondary" index={1} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Миссия */}
      <section className="relative overflow-hidden bg-surface-container-lowest/60 py-16 backdrop-blur-sm md:py-24">
        <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <Reveal className="mb-16 text-center">
            <span className="font-label-mono text-label-mono uppercase tracking-widest text-primary-fixed">
              {text('about.mission_eyebrow')}
            </span>
            <h2 className="mt-4 font-headline-md text-headline-md uppercase text-white">
              {text('about.mission_title')}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {MISSION_CARDS.map((card, index) => (
              <MissionCard
                key={card.number}
                card={card}
                index={index}
                title={text(`about.mission_${index + 1}_title`)}
                description={text(`about.mission_${index + 1}_text`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Команда */}
      <section className="mx-auto max-w-container-max px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <Reveal className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div>
            <span className="mb-4 block font-label-mono text-label-mono uppercase text-secondary">
              {text('about.team_eyebrow')}
            </span>
            <h2 className="font-headline-md text-headline-md uppercase text-white">{text('about.team_title')}</h2>
          </div>
          <p className="max-w-sm font-body-md text-on-surface-variant">{text('about.team_intro')}</p>
        </Reveal>

        {/* Контейнер каскада создаётся только вместе с данными: если он
            смонтируется пустым и попадёт в кадр, viewport.once отработает
            вхолостую, а приехавшие позже карточки останутся невидимыми. */}
        {team && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {team.map((member, index) => (
              <TeamMember key={member.name} member={member} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Призыв */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <Reveal
          {...FADE}
          className="glass-panel relative mx-auto max-w-container-max overflow-hidden p-8 text-center md:p-12"
        >
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary-fixed to-transparent"></div>

          <h2 className="mb-6 font-headline-md text-headline-md uppercase tracking-tight text-white">
            {text('about.cta_title')}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl font-body-lg text-on-surface-variant">{text('about.cta_text')}</p>

          <a
            href="/contacts"
            className="inline-block rounded-sm bg-primary-container px-10 py-5 font-button-text uppercase tracking-widest text-on-primary-container transition-transform duration-300 hover:scale-95"
          >
            Связаться с нами
          </a>
        </Reveal>
      </section>
    </main>
  );
}
