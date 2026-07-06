import { ReactLenis } from "lenis/dist/lenis-react";
import { ParallaxHero } from "../components/ParallaxSchedule.jsx";
import { SplineWrapper } from "../components/SplineWrapper.jsx";


export default function Home() {
  return (
    <ReactLenis root options={{ lerp: 0.05 }}>
      <div className="fixed inset-0 tech-grid pointer-events-none z-0"></div>
          <div className="scanline pointer-events-none z-1"></div>
          <header className="fixed top-0 w-full z-50 bg-surface/30 backdrop-blur-xl border-b border-white/10">
              <div
                  className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
                  <div className="flex items-center gap-4">
                      <span className="font-headline-md text-4xl md:text-5xl font-bold tracking-tighter"><span className="text-[#a4e6ff]">K</span><span className="text-white">AE</span></span>
                  </div>
                  <nav className="hidden lg:flex items-center gap-8 mx-auto">
                      <a className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md"
                          href="/">Главная</a>
                      <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300"
                          href="/products">Продукция</a>
                      <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300"
                          href="/about">О компании</a>
                      <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300"
                          href="/contacts">Контакты</a>
                  </nav>
                  <div className="flex items-center gap-4">
                      <button
                          className="bg-primary-container text-on-primary-container px-6 py-2 rounded-sm font-label-md text-label-md font-bold hover:scale-95 transition-transform duration-200 primary-glow">
                          Get in Touch
                      </button>
                      <button id="menu-toggle" className="lg:hidden text-primary">
                          <span className="material-symbols-outlined">menu</span>
                      </button>
                  </div>
              </div>
          </header>
          {/* Mobile Menu Drawer */}
          <div id="mobile-drawer" className="fixed inset-0 z-[100] closed pointer-events-none flex justify-end">
              <div id="drawer-overlay" className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>
              <div className="relative w-64 md:w-80 bg-surface border-l border-white/10 p-6 flex flex-col gap-8 h-full drawer-content bg-surface/90 backdrop-blur-xl">
                  <div className="flex justify-between items-center">
                      <span className="font-headline-md text-3xl md:text-4xl font-bold tracking-tighter"><span className="text-[#a4e6ff]">K</span><span className="text-white">AE</span></span>
                      <button id="menu-close" className="text-primary hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-2xl">close</span>
                      </button>
                  </div>
                  <nav className="flex flex-col gap-6 mt-8">
                      <a className="text-on-surface-variant font-label-lg hover:text-primary transition-colors duration-300 uppercase tracking-widest border-b border-white/5 pb-4" href="/">Главная</a>
                      <a className="text-on-surface-variant font-label-lg hover:text-primary transition-colors duration-300 uppercase tracking-widest border-b border-white/5 pb-4" href="/products">Продукция</a>
                      <a className="text-on-surface-variant font-label-lg hover:text-primary transition-colors duration-300 uppercase tracking-widest border-b border-white/5 pb-4" href="/about">О компании</a>
                      <a className="text-on-surface-variant font-label-lg hover:text-primary transition-colors duration-300 uppercase tracking-widest border-b border-white/5 pb-4" href="/contacts">Контакты</a>
                  </nav>
              </div>
          </div>
          <main>
              <section className="relative h-screen flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 z-0">
                      <div className="absolute inset-0 overflow-hidden bg-background">
                          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-0 video-zest">
                              <source src="https://cdn.pixabay.com/video/2020/04/23/36979-415518292_large.mp4" type="video/mp4"  />
                          </video>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0e1417_90%)]">
                          </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background"></div>
                      <div className="absolute inset-0 pointer-events-none hidden md:block">
                          <div className="absolute top-1/4 left-10 border-l border-primary/30 pl-4 py-2 text-zest zest-stagger-1">
                              <div className="text-[10px] text-primary/80 tracking-widest uppercase">System Status</div>
                              <div className="text-label-md text-primary font-bold">NOMINAL</div>
                          </div>
                          <div className="absolute bottom-1/4 right-10 border-r border-primary/30 pr-4 py-2 text-right text-zest zest-stagger-2">
                              <div className="text-[10px] text-primary/80 tracking-widest uppercase">Data Stream</div>
                              <div className="text-label-md text-primary font-bold">1.2 GB/S</div>
                          </div>
                      </div>
                  </div>
                  <div
                      className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
                      <div className="lg:col-span-7 space-y-stack-md text-left gap-8">
                          <div
                              className="inline-flex items-center gap-2 px-3 py-1 glass-panel rounded-full border border-primary/30 mb-4 text-zest zest-stagger-1">
                              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                              <span className="font-label-sm text-label-sm tracking-[0.2em] text-primary uppercase">FUTURE
                                  TECHNOLOGY</span>
                          </div>
                          <h1
                              className="font-headline-lg-mobile md:font-display-lg md:text-display-lg text-white leading-tight text-zest zest-stagger-1">
                              <span className="tracking-widest uppercase block mb-2">Инженерные решения</span>
                              <span className="text-primary">нового поколения</span>
                          </h1>
                          <div className="w-24 h-px bg-primary/50 relative overflow-hidden text-zest zest-stagger-2">
                              <div className="absolute inset-0 bg-primary animate-pulse"></div>
                          </div>
                          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl text-zest zest-stagger-2">
                              Создаем современные технологические продукты для промышленности, безопасности и будущих
                              проектов.
                          </p>
                          <div
                              className="flex flex-col sm:flex-row items-stretch sm:items-start gap-stack-md mt-stack-lg text-zest zest-stagger-3">
                              <div className="relative group">
                                  <span
                                      className="absolute -top-4 left-0 font-label-sm text-[10px] text-primary/40 tracking-widest uppercase hidden sm:block">SYS_AUTH:
                                      0x442</span>
                                  <a href="/products" style={{ "display": "inline-block" }}><button
                                          className="w-full sm:w-auto bg-primary-container text-on-primary-container px-10 py-4 rounded-sm font-label-md text-label-md font-black uppercase tracking-widest primary-glow transition-all hover:opacity-90">Каталог
                                          продукции</button></a>
                              </div>
                              <div className="relative group">
                                  <span
                                      className="absolute -top-4 left-0 font-label-sm text-[10px] text-primary/40 tracking-widest uppercase hidden sm:block">COORD:
                                      51.1694° N</span>
                                  <button
                                      className="w-full sm:w-auto glass-panel text-white px-10 py-4 rounded-sm font-label-md text-label-md font-black uppercase tracking-widest border border-outline hover:bg-white/5 transition-all">
                                      Связаться с нами
                                  </button>
                              </div>
                          </div>
                      </div>
                      <div className="hidden lg:flex lg:col-span-5 flex-col items-end gap-8 text-zest zest-stagger-3">
                          <div className="w-full max-w-[750px] h-[500px] ml-auto relative pointer-events-auto rounded-xl overflow-visible">
                              <SplineWrapper />
                          </div>
                          <div className="opacity-40 text-right">
                              <p className="font-label-sm text-[10px] tracking-widest text-on-surface-variant uppercase">Neural
                                  Link Established</p>
                              <p className="font-label-sm text-[10px] tracking-widest text-on-surface-variant uppercase">Data
                                  Stream: 1.2 GB/s</p>
                          </div>
                      </div>
                  </div>
                  <div
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-4 text-on-surface-variant/40 text-zest zest-stagger-3">
                      <span className="font-label-sm text-label-sm">SCROLL TO EXPLORE</span>
                      <div className="w-px h-16 bg-gradient-to-b from-primary-container to-transparent"></div>
                  </div>
              </section>
              <section className="py-stack-xl bg-surface relative z-10">
                  <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                          {/* Benefit Card 1 */}
                          <div className="glass-panel p-8 relative overflow-hidden group reveal stagger-1">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                  <span className="material-symbols-outlined text-6xl"
                                      style={{ "fontVariationSettings": "'FILL' 1" }}>verified</span>
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                  <span className="material-symbols-outlined text-primary" data-icon="verified">verified</span>
                                  <h3 className="font-headline-md text-headline-md text-white">Надежность</h3>
                              </div>
                              <p className="text-on-surface-variant font-body-md leading-relaxed">
                                  Бескомпромиссная стабильность систем в экстремальных условиях эксплуатации.
                              </p>
                              <div className="mt-6 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className="w-3/4 h-full bg-primary-container shadow-[0_0_10px_#00d1ff]"></div>
                              </div>
                          </div>
                          {/* Benefit Card 2 */}
                          <div className="glass-panel p-8 relative overflow-hidden group reveal stagger-2">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                  <span className="material-symbols-outlined text-6xl"
                                      style={{ "fontVariationSettings": "'FILL' 1" }}>memory</span>
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                  <span className="material-symbols-outlined text-primary" data-icon="memory">memory</span>
                                  <h3 className="font-headline-md text-headline-md text-white">Инновации</h3>
                              </div>
                              <p className="text-on-surface-variant font-body-md leading-relaxed">
                                  Использование передовых достижений науки для создания продуктов завтрашнего дня.
                              </p>
                              <div className="mt-6 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className="w-full h-full bg-primary-container shadow-[0_0_10px_#00d1ff] animate-pulse">
                                  </div>
                              </div>
                          </div>
                          {/* Benefit Card 3 */}
                          <div
                              className="glass-panel p-8 relative overflow-hidden group reveal stagger-3 md:col-span-2 lg:col-span-1">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                  <span className="material-symbols-outlined text-6xl"
                                      style={{ "fontVariationSettings": "'FILL' 1" }}>precision_manufacturing</span>
                              </div>
                              <div className="flex items-center gap-3 mb-4">
                                  <span className="material-symbols-outlined text-primary"
                                      data-icon="precision_manufacturing">precision_manufacturing</span>
                                  <h3 className="font-headline-md text-headline-md text-white">Качество</h3>
                              </div>
                              <p className="text-on-surface-variant font-body-md leading-relaxed">
                                  Прецизионная точность в каждой детали и строгий контроль на всех этапах.
                              </p>
                              <div className="mt-6 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className="w-5/6 h-full bg-primary-container shadow-[0_0_10px_#00d1ff]"></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
              <ParallaxHero />
              <section className="py-stack-xl relative overflow-hidden">
                  <div
                      className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                      <div className="space-y-stack-md reveal">
                          <h2 className="font-headline-lg text-headline-lg text-white">Системный инжиниринг</h2>
                          <p className="font-body-lg text-on-surface-variant">
                              Мы специализируемся на проектировании сложных промышленных комплексов, обеспечивая полную
                              интеграцию аппаратного и программного обеспечения.
                          </p>
                          <ul className="flex flex-col gap-6">
                              <li className="flex items-center gap-4 text-on-surface reveal stagger-1">
                                  <div className="w-10 h-10 shrink-0 rounded glass-panel flex items-center justify-center text-primary">
                                      <span className="material-symbols-outlined">rocket_launch</span>
                                  </div>
                                  <span className="font-label-md leading-none">Аэрокосмические разработки</span>
                              </li>
                              <li className="flex items-center gap-4 text-on-surface reveal stagger-2">
                                  <div className="w-10 h-10 shrink-0 rounded glass-panel flex items-center justify-center text-primary">
                                      <span className="material-symbols-outlined">security</span>
                                  </div>
                                  <span className="font-label-md leading-none">Системы безопасности</span>
                              </li>
                              <li className="flex items-center gap-4 text-on-surface reveal stagger-3">
                                  <div className="w-10 h-10 shrink-0 rounded glass-panel flex items-center justify-center text-primary">
                                      <span className="material-symbols-outlined">robot_2</span>
                                  </div>
                                  <span className="font-label-md leading-none">Автоматизация производств</span>
                              </li>
                          </ul>
                      </div>
                      <div className="relative group reveal">
                          <div
                              className="absolute -inset-4 bg-primary/20 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                          </div>
                          <div
                              className="glass-panel aspect-square md:aspect-video relative overflow-hidden rounded-xl border border-white/10">
                              <img className="w-full h-full object-cover"
                                  data-alt="A futuristic industrial robotics lab with neon blue lighting, robotic arms working on high-tech aerospace components, clean surfaces with digital projection grids, and a cinematic technical atmosphere focused on precision engineering and innovation."
                                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCFmyZ2RuE4W5GQoekpwJNaHl7CNmIXN4-CmTk_gc1rH7os8QYUMVUwaF3vl28gG3i6XpUCy1n1kpRLvc2Y_FyJ8y2S2t6LR-zIfeqoLid3DENMoC-NBmy-MG-N9sTX_UA49lR2MkW2au6B9wRSpmmHpdNdWl0et2fbbU9y8jBjwje-A1k2onf2fUuM0RN8C0fqTwwI0Apuws0ynFHt9b-3ttJap0VdR1hmeRIIsbPEA9dpTU5ffusbH3D_GJqdPN8-AqWSC3S4Io"  />
                              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                                  <span className="font-label-sm text-white uppercase tracking-widest">Live System
                                      Telemetry</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
          </main>
          <footer className="bg-surface-container-lowest py-stack-lg border-t border-outline-variant relative z-10">
              <div
                  className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col lg:flex-row justify-between items-center gap-stack-md">
                  <div className="flex flex-col items-center lg:items-start gap-4">
                      <div className="flex items-center gap-2">
                          <span className="font-headline-md text-3xl md:text-4xl font-black tracking-tighter"><span className="text-[#a4e6ff]">K</span><span className="text-white">AE</span></span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant text-center lg:text-left">© 2024 KAE
                          Engineering. READY FOR TOMORROW.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-8">
                      <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-opacity"
                          href="#">LinkedIn</a>
                      <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-opacity"
                          href="#">Twitter</a>
                      <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-opacity"
                          href="#">GitHub</a>
                  </div>
                  <div className="flex gap-4">
                      <div
                          className="w-10 h-10 rounded-sm glass-panel flex items-center justify-center hover:opacity-80 cursor-pointer">
                          <span className="material-symbols-outlined text-primary text-xl">language</span>
                      </div>
                      <div
                          className="w-10 h-10 rounded-sm glass-panel flex items-center justify-center hover:opacity-80 cursor-pointer">
                          <span className="material-symbols-outlined text-primary text-xl">terminal</span>
                      </div>
                  </div>
              </div>
          </footer>
    </ReactLenis>
  );
}
