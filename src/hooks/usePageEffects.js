import { useEffect } from 'react';

export function usePageEffects(path) {
  useEffect(() => {
    const revealElements = () => document.querySelectorAll('.reveal, .reveal-element');

    if (!('IntersectionObserver' in window)) {
      revealElements().forEach((element) => element.classList.add('active'));
      return undefined;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      },
    );

    const observed = new WeakSet();

    const registerNewElements = () => {
      revealElements().forEach((element) => {
        if (observed.has(element)) return;

        observed.add(element);
        revealObserver.observe(element);
      });
    };

    registerNewElements();

    // Карточки товаров и тексты приходят из API уже после монтирования.
    // Без этого наблюдателя они остались бы с opacity: 0, то есть невидимыми.
    const contentObserver = new MutationObserver(registerNewElements);
    contentObserver.observe(document.body, { childList: true, subtree: true });

    const firstScreenTimer = window.setTimeout(() => {
      document.querySelectorAll('section:first-of-type .reveal').forEach((element) => {
        element.classList.add('active');
      });
    }, 100);

    return () => {
      window.clearTimeout(firstScreenTimer);
      contentObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [path]);

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

    menuToggle?.addEventListener('click', openMenu);
    menuClose?.addEventListener('click', closeMenu);
    drawerOverlay?.addEventListener('click', closeMenu);

    return () => {
      closeMenu();
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
    let technicalGrid = document.querySelector('.technical-grid');

    const refreshTargets = () => {
      glassPanels = Array.from(document.querySelectorAll('.glass-panel'));
      technicalGrid = document.querySelector('.technical-grid');
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

      if (technicalGrid) {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        technicalGrid.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
      }
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
