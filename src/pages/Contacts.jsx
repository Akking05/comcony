import { Header } from "../components/layout/Header.jsx";
import { MobileDrawer } from "../components/layout/MobileDrawer.jsx";
import { Footer } from "../components/layout/Footer.jsx";

export default function Contacts() {
  return (
    <>
      <div className="fixed inset-0 tech-grid pointer-events-none z-0"></div>
          <div className="scanline pointer-events-none z-1"></div>
          <Header active="/contacts" />
          <MobileDrawer active="/contacts" />

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

          <Footer />
    </>
  );
}
