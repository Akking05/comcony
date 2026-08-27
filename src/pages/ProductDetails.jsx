import { Header } from "../components/layout/Header.jsx";
import { MobileDrawer } from "../components/layout/MobileDrawer.jsx";
import { Footer } from "../components/layout/Footer.jsx";

export default function ProductDetails() {
  return (
    <>
      <div className="fixed inset-0 tech-grid pointer-events-none z-0"></div>
          <div className="scanline pointer-events-none z-1"></div>
          <Header active="/products" />
          <MobileDrawer active="/products" />

          <main className="pt-[120px] pb-stack-xl max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
              {/* Кнопка назад */}
              <a href="/products" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-8 group reveal-element">
                  <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span className="font-label-md text-label-md uppercase tracking-widest">Назад к каталогу</span>
              </a>
      
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                  {/* Изображение товара */}
                  <div className="glass-card p-2 rounded-lg reveal-element">
                      <div className="aspect-[4/3] w-full overflow-hidden rounded relative">
                          <img id="product-image" alt="Product Image" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD6x6uTf6vNd4PCzVVmnY_29gRbXsolGYsuBQ1T8csAICDEYj7zaW0lonjfDgPbKdxNmfdOd_x-YrWsIS_dbw8JqxqNazeBr_wBWc1iMGNy3D033Rble_99l1JjNV6DEjv7BtkC4oKWlg3HtKsyb6nll9_JhYw8wbFqXaP13ICPSaoHsJdGCu57PlxjFDRyhYV8uiXdA4ESTKKHaEDOkXMHGagiGPs2s_BY3LUueevZi1eskS6dbKAhDxcIzLtTLVj71FcXN2IGI4"  />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
                      </div>
                  </div>
      
                  {/* Информация о товаре */}
                  <div className="flex flex-col justify-center h-full reveal-element stagger-1">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="active-glow"></div>
                          <span id="product-category" className="font-label-md text-label-md text-primary tracking-[0.2em] uppercase px-3 py-1 border border-primary/30 rounded-full bg-primary/5">
                              Беспилотные системы
                          </span>
                      </div>
                      
                      <h1 id="product-title" className="font-display-lg text-headline-lg-mobile md:text-display-lg text-white mb-6">
                          Series-X
                      </h1>
                      
                      <div className="w-16 h-px bg-primary/50 mb-8 relative overflow-hidden">
                          <div className="absolute inset-0 bg-primary animate-pulse"></div>
                      </div>
      
                      <p id="product-description" className="font-body-lg text-body-lg text-on-surface-variant mb-10 leading-relaxed">
                          Автономные решения для разведки и логистики. Designed for high-intensity reconnaissance and rapid deployment. The Series-X represents the pinnacle of autonomous flight research, engineered for complex industrial and tactical applications.
                      </p>
      
                      {/* Основные характеристики (Placeholder для JS) */}
                      <div id="product-specs" className="grid grid-cols-2 gap-6 mb-12">
                          <div className="border-l border-white/10 pl-4">
                              <div className="text-[10px] text-outline tracking-widest uppercase mb-1">Max Altitude</div>
                              <div className="font-label-md text-white">5000 m</div>
                          </div>
                          <div className="border-l border-white/10 pl-4">
                              <div className="text-[10px] text-outline tracking-widest uppercase mb-1">Payload</div>
                              <div className="font-label-md text-white">15 kg</div>
                          </div>
                      </div>
      
                      <div className="flex flex-wrap gap-4">
                          <button className="bg-primary-container text-on-primary-container px-8 py-4 rounded-sm font-label-md text-label-md font-bold uppercase tracking-widest hover:scale-95 transition-transform duration-200 primary-glow">
                              Запросить цену
                          </button>
                          <button className="glass-panel text-white px-8 py-4 rounded-sm font-label-md text-label-md font-bold uppercase tracking-widest border border-outline hover:bg-white/5 transition-all">
                              Документация
                          </button>
                      </div>
                  </div>
              </div>
          </main>

          <Footer />
    </>
  );
}
