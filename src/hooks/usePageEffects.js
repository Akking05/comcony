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

    // Список панелей пересобирается при изменениях DOM — часть из них
    // появляется вместе с данными из API.
    let glassPanels = Array.from(document.querySelectorAll('.glass-panel'));

    const refreshTargets = () => {
      glassPanels = Array.from(document.querySelectorAll('.glass-panel'));
    };

    const targetsObserver = new MutationObserver(refreshTargets);
    targetsObserver.observe(document.body, { childList: true, subtree: true });

    let pointerFrame = 0;
    let lastPointerEvent = null;

    const updatePointerEffects = () => {
      pointerFrame = 0;
      if (!lastPointerEvent) return;

      const event = lastPointerEvent;

      glassPanels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        panel.style.boxShadow =
          distance < 400 ? `0 0 25px rgba(0, 209, 255, ${(1 - distance / 400) * 0.15})` : 'none';
      });
    };

    const handleMouseMove = (event) => {
      lastPointerEvent = event;
      if (!pointerFrame) {
        pointerFrame = window.requestAnimationFrame(updatePointerEffects);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      targetsObserver.disconnect();
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      glassPanels.forEach((panel) => {
        panel.style.boxShadow = '';
      });
    };
  }, [path]);
}
