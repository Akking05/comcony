export default function Contacts() {
  return (
    <>
      <div className="fixed inset-0 tech-grid pointer-events-none z-0"></div>
          <div className="scanline pointer-events-none z-1"></div>
          <header className="fixed top-0 w-full z-50 bg-surface/30 backdrop-blur-xl border-b border-white/10">
              <div
                  className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
                  <div className="flex items-center gap-4">
                      <span className="font-headline-md text-4xl md:text-5xl font-bold tracking-tighter"><span className="text-[#a4e6ff]">K</span><span className="text-white">AE</span></span>
                  </div>
                  <nav className="hidden lg:flex items-center gap-8">
                      <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300"
                          href="/">Главная</a>
                      <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300"
                          href="/products">Продукция</a>
                      <a className="text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-300"
                          href="/about">О компании</a>
                      <a className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md"
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
      
          <main className="pt-32 pb-stack-xl min-h-screen relative z-10 flex flex-col justify-center">
              <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
                  <div className="mb-12 text-center md:text-left reveal">
                      <h1 className="font-headline-lg-mobile md:font-display-lg md:text-display-lg text-white leading-tight mb-4">
                          <span className="text-primary">Контакты</span>
                      </h1>
                      <p className="font-body-lg text-on-surface-variant max-w-2xl">
                          Свяжитесь с нами для обсуждения вашего следующего проекта. Наша команда инженеров готова к новым вызовам.
                      </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Contact Info */}
                      <div className="lg:col-span-5 space-y-6">
                          <div className="glass-panel p-8 relative overflow-hidden group hover:border-primary/50 transition-colors">
                              <div className="absolute -inset-4 bg-primary/10 blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
                              <div className="flex items-start gap-4 relative z-10">
                                  <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                                  <div>
                                      <h3 className="font-headline-sm text-white mb-2">Главный офис</h3>
                                      <p className="text-on-surface-variant font-body-md">пр. Мәңгілік Ел, 55<br />Инновационный центр<br />г. Астана, 010000</p>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="glass-panel p-8 relative overflow-hidden group hover:border-primary/50 transition-colors">
                              <div className="absolute -inset-4 bg-primary/10 blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
                              <div className="flex items-start gap-4 relative z-10">
                                  <span className="material-symbols-outlined text-primary text-3xl">mail</span>
                                  <div>
                                      <h3 className="font-headline-sm text-white mb-2">Email</h3>
                                      <p className="text-on-surface-variant font-body-md">info@kae-engineering.ru<br />support@kae-engineering.ru</p>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="glass-panel p-8 relative overflow-hidden group hover:border-primary/50 transition-colors">
                              <div className="absolute -inset-4 bg-primary/10 blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
                              <div className="flex items-start gap-4 relative z-10">
                                  <span className="material-symbols-outlined text-primary text-3xl">phone</span>
                                  <div>
                                      <h3 className="font-headline-sm text-white mb-2">Телефон</h3>
                                      <p className="text-on-surface-variant font-body-md">+7 (7172) 123-456<br />Пн-Пт: 09:00 - 18:00</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      {/* Contact Form */}
                      <div className="lg:col-span-7">
                          <div className="glass-panel p-8 md:p-10 relative overflow-hidden h-full">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                              <h2 className="font-headline-md text-white mb-8 relative z-10">Напишите нам</h2>
                              
                              <form className="space-y-6 relative z-10" action="#" method="POST">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                          <label htmlFor="name" className="font-label-sm text-on-surface-variant uppercase tracking-wider block">Имя</label>
                                          <input type="text" id="name" name="name" className="w-full bg-surface/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20" placeholder="Иван Иванов" />
                                      </div>
                                      <div className="space-y-2">
                                          <label htmlFor="email" className="font-label-sm text-on-surface-variant uppercase tracking-wider block">Email</label>
                                          <input type="email" id="email" name="email" className="w-full bg-surface/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20" placeholder="ivan@example.com" />
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                      <label htmlFor="subject" className="font-label-sm text-on-surface-variant uppercase tracking-wider block">Тема</label>
                                      <input type="text" id="subject" name="subject" className="w-full bg-surface/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20" placeholder="Вопрос о сотрудничестве" />
                                  </div>
                                  
                                  <div className="space-y-2">
                                      <label htmlFor="message" className="font-label-sm text-on-surface-variant uppercase tracking-wider block">Сообщение</label>
                                      <textarea id="message" name="message" rows="5" className="w-full bg-surface/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-white/20" placeholder="Опишите вашу задачу..."></textarea>
                                  </div>
                                  
                                  <button type="submit" className="w-full sm:w-auto bg-primary-container text-on-primary-container px-10 py-4 rounded-sm font-label-md font-bold uppercase tracking-widest primary-glow transition-all hover:scale-95 inline-flex items-center justify-center gap-2">
                                      Отправить сообщение
                                      <span className="material-symbols-outlined text-sm">send</span>
                                  </button>
                              </form>
                          </div>
                      </div>
                  </div>
                  
                  {/* Map Placeholder / Random Text */}
                  <div className="mt-12 glass-panel p-8 relative overflow-hidden group text-center">
                      <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                      <div className="relative z-10 space-y-4">
                          <span className="material-symbols-outlined text-primary/40 text-5xl mb-2">map</span>
                          <h3 className="font-headline-sm text-white">Интерактивная карта</h3>
                          <p className="text-on-surface-variant font-body-md max-w-3xl mx-auto">
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut vulputate arcu. Donec sit amet accumsan est, ut imperdiet nunc. Vivamus varius ex ac dolor ultrices euismod. Suspendisse pulvinar nisi eget erat bibendum.
                              Fusce lacinia id dolor congue ullamcorper. Pellentesque varius augue purus, quis congue mi porta a.
                          </p>
                      </div>
                  </div>
              </section>
          </main>
      
          <footer className="bg-surface-container-lowest py-stack-lg border-t border-outline-variant relative z-10">
              <div
                  className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col lg:flex-row justify-between items-center gap-stack-md">
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
    </>
  );
}
