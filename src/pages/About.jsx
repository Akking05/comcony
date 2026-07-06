export default function About() {
  return (
    <>
      <div className="fixed inset-0 tech-grid pointer-events-none z-0 opacity-20"></div>
          <div className="scanline pointer-events-none z-1"></div>
          <header className="fixed top-0 w-full z-50 bg-surface/30 backdrop-blur-xl border-b border-white/10">
              <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
                  <div className="flex items-center gap-4">
                      <span className="font-headline-md text-4xl md:text-5xl font-bold tracking-tighter"><span className="text-[#a4e6ff]">K</span><span className="text-white">AE</span></span>
                  </div>
                  <nav className="hidden lg:flex items-center gap-8">
                      <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300" href="/">Главная</a>
                      <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300" href="/products">Продукция</a>
                      <a className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md" href="/about">О компании</a>
                      <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300" href="/contacts">Контакты</a>
                  </nav>
                  <div className="flex items-center gap-4">
                      <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-sm font-label-md text-label-md font-bold hover:scale-95 transition-transform duration-200 primary-glow">
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
      
          <main className="pt-24">
              {/* Hero Section */}
              <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                      <div className="md:col-span-5 text-center md:text-left reveal stagger-1">
                          <span className="font-label-mono text-label-mono text-primary-fixed uppercase tracking-widest block mb-4">Инженерное будущее Казахстана</span>
                          <h1 className="font-headline-lg-mobile md:font-display-md text-white mb-6 uppercase">О компании</h1>
                          <div className="w-16 h-[2px] bg-primary-fixed mx-auto md:mx-0 mb-8"></div>
                      </div>
                      <div className="md:col-span-7 space-y-6 reveal stagger-2">
                          <p className="font-body-lg text-body-lg text-on-surface">
                              KAE Engineering занимает центральное место в технологической модернизации Казахстана. Наша деятельность охватывает проектирование сложных систем, разработку программно-аппаратных комплексов и интеграцию интеллектуальных решений для индустриального сектора.
                          </p>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                              Будучи резидентом инновационного кластера столицы, мы не просто производим оборудование — мы формируем стандарты инженерии нового поколения. Наша лаборатория в Астане является колыбелью для решений в области автоматизации, систем безопасности и высокоточного приборостроения.
                          </p>
                          <div className="grid grid-cols-2 gap-4 mt-12">
                              <div className="glass-panel p-6 border-l-4 border-l-primary-fixed">
                                  <div className="font-label-mono text-[32px] text-primary-fixed font-bold mb-1">250+</div>
                                  <div className="font-label-mono text-[10px] text-outline uppercase">Инженеров высшей категории</div>
                              </div>
                              <div className="glass-panel p-6 border-l-4 border-l-secondary">
                                  <div className="font-label-mono text-[32px] text-secondary font-bold mb-1">15+</div>
                                  <div className="font-label-mono text-[10px] text-outline uppercase">Запатентованных технологий</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
      
              {/* Mission Section */}
              <section className="py-16 md:py-24 bg-surface-container-lowest relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full scanline opacity-20 pointer-events-none"></div>
                  <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
                      <div className="text-center mb-16 reveal">
                          <span className="font-label-mono text-label-mono text-primary-fixed uppercase tracking-widest">Стратегия</span>
                          <h2 className="font-headline-md text-headline-md text-white mt-4 uppercase">Миссия и Видение</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Mission Card 1 */}
                          <div className="glass-panel p-8 relative group hover:border-primary-fixed/50 transition-all duration-500 reveal stagger-1">
                              <div className="absolute -top-4 -right-4 font-label-mono text-outline-variant/20 text-6xl font-bold italic">01</div>
                              <div className="w-12 h-12 flex items-center justify-center bg-primary-fixed/10 border border-primary-fixed/30 mb-6 text-primary-fixed">
                                  <span className="material-symbols-outlined">architecture</span>
                              </div>
                              <h3 className="font-headline-md text-[24px] text-white mb-4">Инновации</h3>
                              <p className="font-body-md text-on-surface-variant">Внедрение передовых инженерных решений, которые определяют конкурентоспособность отечественной промышленности на мировом рынке.</p>
                          </div>
                          {/* Mission Card 2 */}
                          <div className="glass-panel p-8 relative group hover:border-secondary/50 transition-all duration-500 reveal stagger-2">
                              <div className="absolute -top-4 -right-4 font-label-mono text-outline-variant/20 text-6xl font-bold italic">02</div>
                              <div className="w-12 h-12 flex items-center justify-center bg-secondary/10 border border-secondary/30 mb-6 text-secondary">
                                  <span className="material-symbols-outlined">diversity_3</span>
                              </div>
                              <h3 className="font-headline-md text-[24px] text-white mb-4">Развитие талантов</h3>
                              <p className="font-body-md text-on-surface-variant">Создание уникальной среды для роста инженерных кадров Казахстана через трансфер технологий и практический опыт.</p>
                          </div>
                          {/* Mission Card 3 */}
                          <div className="glass-panel p-8 relative group hover:border-primary-fixed/50 transition-all duration-500 reveal stagger-3">
                              <div className="absolute -top-4 -right-4 font-label-mono text-outline-variant/20 text-6xl font-bold italic">03</div>
                              <div className="w-12 h-12 flex items-center justify-center bg-primary-fixed/10 border border-primary-fixed/30 mb-6 text-primary-fixed">
                                  <span className="material-symbols-outlined">verified_user</span>
                              </div>
                              <h3 className="font-headline-md text-[24px] text-white mb-4">Надежность</h3>
                              <p className="font-body-md text-on-surface-variant">Гарантия безупречного качества и безопасности каждого узла, разработанного в стенах KAE Engineering.</p>
                          </div>
                      </div>
                  </div>
              </section>
      
              {/* Team Section */}
              <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 reveal">
                      <div>
                          <span className="font-label-mono text-label-mono text-secondary uppercase block mb-4">Экспертиза</span>
                          <h2 className="font-headline-md text-headline-md text-white uppercase">Наша команда</h2>
                      </div>
                      <p className="font-body-md text-on-surface-variant max-w-sm">
                          Сообщество профессионалов, вдохновленных идеей создания технологий, которые работают на благо прогресса.
                      </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {/* Team Member 1 */}
                      <div className="group reveal stagger-1">
                          <div className="relative mb-6 overflow-hidden aspect-[3/4] rounded-sm">
                              <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBB18ZXo0sXjVg4sqToVZtIa-MVgF0GJWHkiJ-OBNFl4ZUd3iIA_2cSoMjeIqoMt79rqwUbX7upADsA5-nYXMNZPYfITMgKWNqisRtRoMw1LcZknqi8zJwuQVWxE-EEWZMGAkEff1nih0UsbfhcwujWgymusu99UCcv7ZYNXSGBgEgrzSzRCArREwd0-NMWW7OKl-X44s1g4O3c7ZQwrVakavHro6m1l2MV3Fr8xSoSdWlJLaihv90gstG4pIhhb2QuXW21aXDvm38')" }}></div>
                              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                  <span className="bg-surface/80 backdrop-blur px-2 py-1 font-label-mono text-[10px] text-primary-fixed border border-primary-fixed/30 uppercase">Senior Eng</span>
                                  <span className="bg-surface/80 backdrop-blur px-2 py-1 font-label-mono text-[10px] text-secondary border border-secondary/30 uppercase">PhD</span>
                              </div>
                          </div>
                          <h4 className="font-headline-md text-[18px] text-white">Арман Искаков</h4>
                          <p className="font-label-mono text-outline uppercase text-[12px] mt-1">Главный архитектор систем</p>
                      </div>
                      {/* Team Member 2 */}
                      <div className="group reveal stagger-2">
                          <div className="relative mb-6 overflow-hidden aspect-[3/4] rounded-sm">
                              <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3TG56giZZ_NQVACNerzwPObmT_BELn8nrIUupBDy0z1A80R7inLQbLepei34CscJ3vMJQPOaUvzWatzz3Yr5ShIp1eukvKi7W9DuVw_tyO9YELbWsNePyTclmOzfTfDM0ARqHxTga6741gOd4CvSfKB0u_U5oamlk6zAgAaXBLHCWZnB6w2A6p8Ai5ZO047dloPAjXFpXNAa39Ou-7CrSkB7BHPTMAzfwHzPI3-5g1w1lbQJhy35dJQQaGO7dzLHFK2Zs35N4Vrg')" }}></div>
                              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                  <span className="bg-surface/80 backdrop-blur px-2 py-1 font-label-mono text-[10px] text-primary-fixed border border-primary-fixed/30 uppercase">Robotics</span>
                                  <span className="bg-surface/80 backdrop-blur px-2 py-1 font-label-mono text-[10px] text-secondary border border-secondary/30 uppercase">Lead</span>
                              </div>
                          </div>
                          <h4 className="font-headline-md text-[18px] text-white">Динара Султан</h4>
                          <p className="font-label-mono text-outline uppercase text-[12px] mt-1">Руководитель отдела робототехники</p>
                      </div>
                      {/* Team Member 3 */}
                      <div className="group reveal stagger-3">
                          <div className="relative mb-6 overflow-hidden aspect-[3/4] rounded-sm">
                              <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCObsC_IXwroikR-Dwhl-E2tIHHC1v5fOZgCNTA4zRx0RLoC18T8CAufGPyB118c13cqOx9s4mtP3KkbFR6Prcoc0iHmFHzScFJxypKYV8yOtICqov9xTMOYC4eGfegm5h62sG-Tql_57AxstOa1oqaXdnUS9HDv_mppfV8D_-NYsCmje9EpnFjmF9c4VwZZ-_RUHIdenp34YXskYYRm2_qu_sPqP4Xf1YQM_zo1i_blAcXDV5UmjsU3kHUJccQ-YHQTtbcwLu1oss')" }}></div>
                              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                  <span className="bg-surface/80 backdrop-blur px-2 py-1 font-label-mono text-[10px] text-primary-fixed border border-primary-fixed/30 uppercase">Hardware</span>
                                  <span className="bg-surface/80 backdrop-blur px-2 py-1 font-label-mono text-[10px] text-secondary border border-secondary/30 uppercase">Dev</span>
                              </div>
                          </div>
                          <h4 className="font-headline-md text-[18px] text-white">Виктор Пак</h4>
                          <p className="font-label-mono text-outline uppercase text-[12px] mt-1">Ведущий разработчик плат</p>
                      </div>
                      {/* Team Member 4 */}
                      <div className="group reveal stagger-4">
                          <div className="relative mb-6 overflow-hidden aspect-[3/4] rounded-sm">
                              <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ "backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDQBLO-UTZA2w2nzTIxGmgEVOKb19P_aGDx89hJeRm2sRk9AuYLoDxZfuRLqQohK5snyQpFQu8zCBAcN60-JQK97GBmN93wE2qgouPh1oUU1GxXCLRoBgPjEItHDS4Y-h5K9nHLgBG_6IjDphTkFnxnD0207My11p7Ccxk24ZrY-f5C3DxDr1mwuZ_G5btY4l8ZzMz3fV0YZO4yFVmLTuQjJApFU904t7vRnQS_aGM0QPX40dXtvVCl7Xav2uZFyl5m5J2VpgQ_7IY')" }}></div>
                              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                  <span className="bg-surface/80 backdrop-blur px-2 py-1 font-label-mono text-[10px] text-primary-fixed border border-primary-fixed/30 uppercase">Ops</span>
                                  <span className="bg-surface/80 backdrop-blur px-2 py-1 font-label-mono text-[10px] text-secondary border border-secondary/30 uppercase">Director</span>
                              </div>
                          </div>
                          <h4 className="font-headline-md text-[18px] text-white">Данияр Омаров</h4>
                          <p className="font-label-mono text-outline uppercase text-[12px] mt-1">Директор по операциям</p>
                      </div>
                  </div>
              </section>
      
              {/* CTA Section */}
              <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop">
                  <div className="max-w-container-max mx-auto glass-panel p-8 md:p-12 text-center relative overflow-hidden reveal">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-fixed to-transparent"></div>
                      <h2 className="font-headline-md text-headline-md text-white mb-6 uppercase tracking-tight">Готовы к сотрудничеству?</h2>
                      <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
                          Присоединяйтесь к числу лидеров индустрии, выбирающих KAE Engineering для реализации самых сложных технологических задач.
                      </p>
                      <button className="bg-primary-container text-on-primary-container px-10 py-5 font-button-text uppercase tracking-widest hover:scale-95 transition-transform duration-300 rounded-sm">
                          Связаться с нами
                      </button>
                  </div>
              </section>
          </main>
      
          <footer className="bg-surface-container-lowest py-stack-lg border-t border-outline-variant relative z-10">
              <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col lg:flex-row justify-between items-center gap-stack-md">
                  <div className="flex flex-col items-center lg:items-start gap-4">
                      <div className="flex items-center gap-2">
                          <span className="font-headline-md text-3xl md:text-4xl font-black tracking-tighter"><span className="text-[#a4e6ff]">K</span><span className="text-white">AE</span></span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant text-center lg:text-left">© 2024 KAE Engineering. READY FOR TOMORROW.</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-8">
                      <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-opacity" href="#">LinkedIn</a>
                      <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-opacity" href="#">Twitter</a>
                      <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-opacity" href="#">GitHub</a>
                  </div>
                  <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-sm glass-panel flex items-center justify-center hover:opacity-80 cursor-pointer">
                          <span className="material-symbols-outlined text-primary text-xl">language</span>
                      </div>
                      <div className="w-10 h-10 rounded-sm glass-panel flex items-center justify-center hover:opacity-80 cursor-pointer">
                          <span className="material-symbols-outlined text-primary text-xl">terminal</span>
                      </div>
                  </div>
              </div>
          </footer>
    </>
  );
}
