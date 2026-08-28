import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { ParallaxHero } from '../components/ParallaxSchedule.jsx';
import { SplineWrapper } from '../components/SplineWrapper.jsx';

import { fillBar, rise, riseItem, riseOnScroll } from '../lib/motion.js';

const BENEFITS = [
  {
    icon: 'verified',
    title: 'Надежность',
    text: 'Бескомпромиссная стабильность систем в экстремальных условиях эксплуатации.',
    level: '75%',
  },
  {
    icon: 'memory',
    title: 'Инновации',
    text: 'Использование передовых достижений науки для создания продуктов завтрашнего дня.',
    level: '100%',
  },
  {
    icon: 'precision_manufacturing',
    title: 'Качество',
    text: 'Прецизионная точность в каждой детали и строгий контроль на всех этапах.',
    level: '85%',
  },
];

const DIRECTIONS = [
  { icon: 'rocket_launch', label: 'Аэрокосмические разработки' },
  { icon: 'security', label: 'Системы безопасности' },
  { icon: 'robot_2', label: 'Автоматизация производств' },
];

const READOUTS = [
  { label: 'System Status', value: 'NOMINAL', position: 'top-1/4 left-10 border-l pl-4' },
  { label: 'Data Stream', value: '1.2 GB/S', position: 'bottom-1/4 right-10 border-r pr-4 text-right' },
];

function Hero() {
  const ref = useRef(null);

  // Содержимое героя медленно уплывает при прокрутке — глубина без параллакс-хаков.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center justify-center overflow-hidden py-28 md:py-0">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="video-zest h-full w-full object-cover opacity-0"
          >
            <source src="https://cdn.pixabay.com/video/2020/04/23/36979-415518292_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0e1417_88%)]"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-transparent to-background"></div>

        <div className="pointer-events-none absolute inset-0 hidden md:block">
          {READOUTS.map((readout, index) => (
            <motion.div
              key={readout.label}
              {...rise(1.1 + index * 0.15)}
              className={`absolute border-primary/30 py-2 ${readout.position}`}
            >
              <div className="text-[10px] uppercase tracking-widest text-primary/80">{readout.label}</div>
              <div className="text-label-md font-bold text-primary">{readout.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto grid w-full max-w-container-max grid-cols-1 items-center gap-gutter px-margin-mobile md:px-margin-desktop lg:grid-cols-12"
      >
        <div className="space-y-stack-md text-left lg:col-span-7">
          <motion.div
            {...rise(0.1)}
            className="glass-panel mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container"></span>
            <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-primary">
              Future Technology
            </span>
          </motion.div>

          <motion.h1
            {...rise(0.2)}
            className="font-headline-lg-mobile text-headline-lg-mobile leading-tight text-white md:font-display-lg md:text-display-lg"
          >
            <span className="mb-2 block uppercase tracking-widest">Инженерные решения</span>
            <span className="text-primary">нового поколения</span>
          </motion.h1>

          <motion.div {...rise(0.35)} className="relative h-px w-24 overflow-hidden bg-primary/50">
            <div className="absolute inset-0 animate-pulse bg-primary"></div>
          </motion.div>

          <motion.p {...rise(0.45)} className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
            Создаем современные технологические продукты для промышленности, безопасности и будущих проектов.
          </motion.p>

          <motion.div
            {...rise(0.6)}
            className="mt-stack-lg flex flex-col items-stretch gap-stack-md sm:flex-row sm:items-start"
          >
            <div className="relative">
              <span className="absolute -top-4 left-0 hidden font-label-sm text-[10px] uppercase tracking-widest text-primary/40 sm:block">
                SYS_AUTH: 0x442
              </span>
              <a
                href="/products"
                className="primary-glow inline-block w-full rounded-sm bg-primary-container px-10 py-4 text-center font-label-md text-label-md font-black uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 sm:w-auto"
              >
                Каталог продукции
              </a>
            </div>

            <div className="relative">
              <span className="absolute -top-4 left-0 hidden font-label-sm text-[10px] uppercase tracking-widest text-primary/40 sm:block">
                COORD: 51.1694° N
              </span>
              <a
                href="/contacts"
                className="glass-panel inline-block w-full rounded-sm border border-outline px-10 py-4 text-center font-label-md text-label-md font-black uppercase tracking-widest text-white transition-all hover:bg-white/5 sm:w-auto"
              >
                Связаться с нами
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div {...rise(0.5)} className="hidden flex-col items-end gap-8 lg:col-span-5 lg:flex">
          <div className="relative ml-auto h-[500px] w-full max-w-[750px] overflow-visible rounded-xl">
            <SplineWrapper />
          </div>
          <div className="text-right opacity-40">
            <p className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">
              Neural Link Established
            </p>
            <p className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">
              Data Stream: 1.2 GB/s
            </p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        {...rise(1.4)}
        className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-4 text-on-surface-variant/40 lg:flex"
      >
        <span className="font-label-sm text-label-sm">Scroll to explore</span>
        <div className="h-16 w-px bg-gradient-to-b from-primary-container to-transparent"></div>
      </motion.div>
    </section>
  );
}

function BenefitCard({ benefit, index }) {
  return (
    <motion.div
      {...riseItem(index, 0.1)}
      className="glass-panel group relative overflow-hidden p-8 transition-colors hover:border-primary/40"
    >
      <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-30">
        <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {benefit.icon}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">{benefit.icon}</span>
        <h3 className="font-headline-md text-headline-md text-white">{benefit.title}</h3>
      </div>

      <p className="font-body-md leading-relaxed text-on-surface-variant">{benefit.text}</p>

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          {...fillBar(benefit.level, 0.2 + index * 0.1)}
          className="h-full bg-primary-container shadow-[0_0_10px_#00d1ff]"
        ></motion.div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="relative z-10 bg-surface/40 py-stack-lg backdrop-blur-sm md:py-stack-xl">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit, index) => (
              <BenefitCard key={benefit.title} benefit={benefit} index={index} />
            ))}
          </div>
        </div>
      </section>

      <ParallaxHero />

      <section className="relative overflow-hidden py-stack-xl">
        <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-16 px-margin-mobile md:px-margin-desktop lg:grid-cols-2">
          <motion.div {...riseOnScroll()} className="space-y-stack-md">
            <h2 className="font-headline-lg text-headline-lg text-white">Системный инжиниринг</h2>
            <p className="font-body-lg text-on-surface-variant">
              Мы специализируемся на проектировании сложных промышленных комплексов, обеспечивая полную интеграцию
              аппаратного и программного обеспечения.
            </p>

            <ul className="flex flex-col gap-6">
              {DIRECTIONS.map((direction, index) => (
                <motion.li
                  key={direction.label}
                  {...riseItem(index + 1, 0.1)}
                  className="group flex items-center gap-4 text-on-surface"
                >
                  <div className="glass-panel flex h-10 w-10 shrink-0 items-center justify-center rounded text-primary transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined">{direction.icon}</span>
                  </div>
                  <span className="font-label-md leading-none">{direction.label}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...riseOnScroll(0.15)} className="group relative">
            <div className="absolute -inset-4 bg-primary/20 opacity-20 blur-3xl transition-opacity group-hover:opacity-40"></div>
            <div className="glass-panel relative aspect-square overflow-hidden rounded-xl border border-white/10 md:aspect-video">
              <img
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Промышленная роботизированная лаборатория: манипуляторы работают с аэрокосмическими компонентами в неоновой синей подсветке."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCFmyZ2RuE4W5GQoekpwJNaHl7CNmIXN4-CmTk_gc1rH7os8QYUMVUwaF3vl28gG3i6XpUCy1n1kpRLvc2Y_FyJ8y2S2t6LR-zIfeqoLid3DENMoC-NBmy-MG-N9sTX_UA49lR2MkW2au6B9wRSpmmHpdNdWl0et2fbbU9y8jBjwje-A1k2onf2fUuM0RN8C0fqTwwI0Apuws0ynFHt9b-3ttJap0VdR1hmeRIIsbPEA9dpTU5ffusbH3D_GJqdPN8-AqWSC3S4Io"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-400"></div>
                <span className="font-label-sm uppercase tracking-widest text-white">Live System Telemetry</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
