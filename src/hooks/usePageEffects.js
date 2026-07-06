import { useEffect } from 'react';

export function usePageEffects(path) {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-element');

    if ('IntersectionObserver' in window) {
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

      revealElements.forEach((element) => revealObserver.observe(element));

      window.setTimeout(() => {
        document.querySelectorAll('section:first-of-type .reveal').forEach((element) => {
          element.classList.add('active');
        });
      }, 100);

      return () => revealObserver.disconnect();
    }

    revealElements.forEach((element) => element.classList.add('active'));
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
    const glassPanels = Array.from(document.querySelectorAll('.glass-panel'));
    const technicalGrid = document.querySelector('.technical-grid');
    const canUsePointerEffects = window.matchMedia('(pointer: fine)').matches && (glassPanels.length || technicalGrid);

    if (!canUsePointerEffects) return undefined;

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
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      glassPanels.forEach((panel) => {
        panel.style.boxShadow = '';
      });
    };
  }, [path]);
}
