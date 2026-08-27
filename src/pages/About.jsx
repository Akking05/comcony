import { Header } from '../components/layout/Header.jsx';
import { MobileDrawer } from '../components/layout/MobileDrawer.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { useApi } from '../hooks/useApi.js';
import { api } from '../lib/api.js';

const MISSION_CARDS = [
  { number: '01', icon: 'architecture', accent: 'primary-fixed' },
  { number: '02', icon: 'diversity_3', accent: 'secondary' },
  { number: '03', icon: 'verified_user', accent: 'primary-fixed' },
];

function MissionCard({ card, index, title, description }) {
  const isSecondary = card.accent === 'secondary';

  return (
    <div
      className={`glass-panel p-8 relative group transition-all duration-500 reveal stagger-${index + 1} ${
        isSecondary ? 'hover:border-secondary/50' : 'hover:border-primary-fixed/50'
      }`}
    >
      <div className="absolute -top-4 -right-4 font-label-mono text-outline-variant/20 text-6xl font-bold italic">
        {card.number}
      </div>
      <div
        className={`w-12 h-12 flex items-center justify-center mb-6 border ${
          isSecondary
            ? 'bg-secondary/10 border-secondary/30 text-secondary'
            : 'bg-primary-fixed/10 border-primary-fixed/30 text-primary-fixed'
        }`}
      >
        <span className="material-symbols-outlined">{card.icon}</span>
      </div>
      <h3 className="font-headline-md text-[24px] text-white mb-4">{title}</h3>
      <p className="font-body-md text-on-surface-variant">{description}</p>
    </div>
  );
}

function TeamMember({ member, index }) {
  return (
    <div className={`group reveal stagger-${Math.min(index + 1, 4)}`}>
      <div className="relative mb-6 overflow-hidden aspect-[3/4] rounded-sm bg-surface-container-high">
        {member.photo ? (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url('${member.photo}')` }}
          ></div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-outline/30">
            <span className="material-symbols-outlined text-5xl">person</span>
          </div>
        )}
        {member.tags.length > 0 && (
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {member.tags.map((tag, tagIndex) => (
              <span
                key={tag}
                className={`bg-surface/80 backdrop-blur px-2 py-1 font-label-mono text-[10px] uppercase border ${
                  tagIndex === 0
                    ? 'text-primary-fixed border-primary-fixed/30'
                    : 'text-secondary border-secondary/30'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <h4 className="font-headline-md text-[18px] text-white">{member.name}</h4>
      <p className="font-label-mono text-outline uppercase text-[12px] mt-1">{member.position}</p>
    </div>
  );
}

export default function About() {
  const { data: texts } = useApi((signal) => api.texts(signal));
  const { data: team } = useApi((signal) => api.team(signal));

  const text = (key, fallback = '') => texts?.[key] ?? fallback;

  return (
    <>
      <div className="fixed inset-0 tech-grid pointer-events-none z-0 opacity-20"></div>
      <div className="scanline pointer-events-none z-1"></div>
      <Header active="/about" />
      <MobileDrawer active="/about" />

      <main className="pt-24">
        {/* Вступление */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 text-center md:text-left reveal stagger-1">
              <span className="font-label-mono text-label-mono text-primary-fixed uppercase tracking-widest block mb-4">
                {text('about.eyebrow')}
              </span>
              <h1 className="font-headline-lg-mobile md:font-display-md text-white mb-6 uppercase">
                {text('about.title', 'О компании')}
              </h1>
              <div className="w-16 h-[2px] bg-primary-fixed mx-auto md:mx-0 mb-8"></div>
            </div>
            <div className="md:col-span-7 space-y-6 reveal stagger-2">
              <p className="font-body-lg text-body-lg text-on-surface">{text('about.intro_1')}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{text('about.intro_2')}</p>
              <div className="grid grid-cols-2 gap-4 mt-12">
                <div className="glass-panel p-6 border-l-4 border-l-primary-fixed">
                  <div className="font-label-mono text-[32px] text-primary-fixed font-bold mb-1">
                    {text('about.stat_1_value')}
                  </div>
                  <div className="font-label-mono text-[10px] text-outline uppercase">{text('about.stat_1_label')}</div>
                </div>
                <div className="glass-panel p-6 border-l-4 border-l-secondary">
                  <div className="font-label-mono text-[32px] text-secondary font-bold mb-1">
                    {text('about.stat_2_value')}
                  </div>
                  <div className="font-label-mono text-[10px] text-outline uppercase">{text('about.stat_2_label')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Миссия */}
        <section className="py-16 md:py-24 bg-surface-container-lowest relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full scanline opacity-20 pointer-events-none"></div>
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
            <div className="text-center mb-16 reveal">
              <span className="font-label-mono text-label-mono text-primary-fixed uppercase tracking-widest">
                {text('about.mission_eyebrow')}
              </span>
              <h2 className="font-headline-md text-headline-md text-white mt-4 uppercase">
                {text('about.mission_title')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 reveal">
            <div>
              <span className="font-label-mono text-label-mono text-secondary uppercase block mb-4">
                {text('about.team_eyebrow')}
              </span>
              <h2 className="font-headline-md text-headline-md text-white uppercase">{text('about.team_title')}</h2>
            </div>
            <p className="font-body-md text-on-surface-variant max-w-sm">{text('about.team_intro')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team?.map((member, index) => (
              <TeamMember key={member.name} member={member} index={index} />
            ))}
          </div>
        </section>

        {/* Призыв */}
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto glass-panel p-8 md:p-12 text-center relative overflow-hidden reveal">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-fixed to-transparent"></div>
            <h2 className="font-headline-md text-headline-md text-white mb-6 uppercase tracking-tight">
              {text('about.cta_title')}
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">{text('about.cta_text')}</p>
            <a
              href="/contacts"
              className="inline-block bg-primary-container text-on-primary-container px-10 py-5 font-button-text uppercase tracking-widest hover:scale-95 transition-transform duration-300 rounded-sm"
            >
              Связаться с нами
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
