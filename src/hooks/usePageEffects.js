import { useEffect } from 'react';

/**
 * Императивные эффекты страниц: мобильное меню и подсветка панелей курсором.
 *
 * Появление элементов при прокрутке раньше жило здесь на IntersectionObserver,
 * теперь этим занимается motion прямо в разметке — см. src/lib/motion.js.
 */
export function usePageEffects(path) {
  useEffect(() => {
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const mobileDrawer = document.getElementById('mobile-drawer');

    const openMenu = () => {
      if (!mobileDrawer) return;

      mobileDrawer.classList.remove('closed');
      mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      if (!mobileDrawer) return;

      mobileDrawer.classList.remove('open');
      mobileDrawer.classList.add('closed');
      document.body.style.overflow = '';
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };

    // Переход по пункту меню должен его закрывать: маршрут меняется
    // без перезагрузки, само оно не свернётся.
    const onDrawerClick = (event) => {
      if (event.target.closest('a')) closeMenu();
    };

    menuToggle?.addEventListener('click', openMenu);
    mobileDrawer?.addEventListener('click', onDrawerClick);
    document.addEventListener('keydown', onKeyDown);
    menuClose?.addEventListener('click', closeMenu);
    drawerOverlay?.addEventListener('click', closeMenu);

    return () => {
      closeMenu();
      document.removeEventListener('keydown', onKeyDown);
      mobileDrawer?.removeEventListener('click', onDrawerClick);
      menuToggle?.removeEventListener('click', openMenu);
      menuClose?.removeEventListener('click', closeMenu);
      drawerOverlay?.removeEventListener('click', closeMenu);
    };
  }, [path]);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    const RADIUS = 400;

    /**
     * Подсветка панелей под курсором.
     *
     * Раньше на каждом кадре у каждой панели спрашивался
     * getBoundingClientRect, а сразу следом ей писался boxShadow. Чередование
     * чтения и записи заставляет браузер пересчитывать раскладку внутри
     * кадра — на странице товара это два десятка пересчётов на движение мыши.
     *
     * Теперь координаты меряются пачкой и живут в кеше, а он сбрасывается
     * только когда реально устарел: прокрутка, изменение размера окна,
     * появление новых панелей вместе с данными из API.
     */
    let panels = [];
    let stale = true;

    const invalidate = () => {
      stale = true;
    };

    const measure = () => {
      panels = Array.from(document.querySelectorAll('.glass-panel')).map((element) => {
        const rect = element.getBoundingClientRect();

        return {
          element,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          shadow: element.style.boxShadow,
        };
      });

      stale = false;
    };

    let pointerFrame = 0;
    let pointer = null;

    const updatePointerEffects = () => {
      pointerFrame = 0;
      if (!pointer) return;

      if (stale) measure();

      for (const panel of panels) {
        const dx = pointer.x - panel.x;
        const dy = pointer.y - panel.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const shadow =
          distance < RADIUS ? `0 0 25px rgba(0, 209, 255, ${(1 - distance / RADIUS) * 0.15})` : 'none';

        // Запись в style — это работа для браузера даже при том же значении.
        // Панелей, у которых подсветка не изменилась, большинство.
        if (shadow !== panel.shadow) {
          panel.element.style.boxShadow = shadow;
          panel.shadow = shadow;
        }
      }
    };

    const handleMouseMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY };

      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(updatePointerEffects);
    };

    // Наблюдатель только помечает кеш устаревшим: пересобирать список прямо
    // в его обработчике значило бы делать это на каждое изменение DOM,
    // а их во время анимаций много.
    const targetsObserver = new MutationObserver(invalidate);
    targetsObserver.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
      targetsObserver.disconnect();

      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);

      for (const panel of panels) panel.element.style.boxShadow = '';
    };
  }, [path]);
}
