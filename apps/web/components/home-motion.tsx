'use client';

import { useEffect, useRef } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FINE_POINTER_QUERY = '(pointer: fine)';

function revealImmediately(elements: HTMLElement[]) {
  for (const element of elements) {
    element.dataset.revealed = 'true';
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function HomeMotion() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const cursor = cursorRef.current;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const finePointer = window.matchMedia(FINE_POINTER_QUERY).matches;
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    const parallaxLayers = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.ar-home-hero-media, .ar-internal-hero-media, .ar-school-hero-media, .ar-feature-image > div, .ar-school-image, .ar-person-image',
      ),
    );
    const depthCards = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.ar-quick-access a, .ar-school-card, .ar-trust-grid article, .ar-journey-grid li',
      ),
    );
    const magneticTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.ar-hero-actions a, .header-cta, .ar-final-cta > a, .ar-section-copy > a',
      ),
    );

    root.classList.add('motion-enabled');
    root.dataset.reducedMotion = reducedMotion ? 'true' : 'false';

    let scrollFrame = 0;
    let cursorFrame = 0;
    let cursorX = -80;
    let cursorY = -80;

    const updateScrollState = () => {
      scrollFrame = 0;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const progress = clamp(window.scrollY / maxScroll, 0, 1);

      root.dataset.scrolled = window.scrollY > 18 ? 'true' : 'false';
      root.style.setProperty('--motion-progress', progress.toFixed(4));

      if (reducedMotion) return;

      for (const layer of parallaxLayers) {
        const rect = layer.getBoundingClientRect();
        const centerDelta =
          (rect.top + rect.height / 2 - window.innerHeight / 2) /
          window.innerHeight;
        const shift = clamp(centerDelta * -34, -34, 34);
        layer.style.setProperty('--parallax-y', `${shift.toFixed(2)}px`);
      }
    };

    const requestScrollUpdate = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate, { passive: true });

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealImmediately(revealElements);
    }

    const observer =
      reducedMotion || !('IntersectionObserver' in window)
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) continue;

                const element = entry.target as HTMLElement;
                element.dataset.revealed = 'true';
                observer?.unobserve(element);
              }
            },
            { rootMargin: '0px 0px -9% 0px', threshold: 0.1 },
          );

    revealElements.forEach((element) => observer?.observe(element));

    const cleanups: Array<() => void> = [];

    if (!reducedMotion && finePointer) {
      const renderCursor = () => {
        cursorFrame = 0;
        if (!cursor) return;
        cursor.style.setProperty('--cursor-x', `${cursorX}px`);
        cursor.style.setProperty('--cursor-y', `${cursorY}px`);
      };

      const onPointerMove = (event: PointerEvent) => {
        cursorX = event.clientX;
        cursorY = event.clientY;
        root.style.setProperty(
          '--pointer-shift-x',
          `${((event.clientX / window.innerWidth - 0.5) * 14).toFixed(2)}px`,
        );
        root.style.setProperty(
          '--pointer-shift-y',
          `${((event.clientY / window.innerHeight - 0.5) * 10).toFixed(2)}px`,
        );
        if (cursor) cursor.dataset.visible = 'true';
        if (!cursorFrame) cursorFrame = window.requestAnimationFrame(renderCursor);
      };

      const onPointerOver = (event: PointerEvent) => {
        const target = event.target;
        if (!(target instanceof Element) || !cursor) return;
        cursor.dataset.active = target.closest(
          'a, button, summary, input, textarea, select, [role="button"]',
        )
          ? 'true'
          : 'false';
      };

      const onPointerLeaveWindow = () => {
        if (cursor) cursor.dataset.visible = 'false';
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerover', onPointerOver, { passive: true });
      document.addEventListener('mouseleave', onPointerLeaveWindow);

      cleanups.push(() => {
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerover', onPointerOver);
        document.removeEventListener('mouseleave', onPointerLeaveWindow);
      });

      for (const card of depthCards) {
        const onCardMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
          const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
          const tiltX = (0.5 - y) * 5.2;
          const tiltY = (x - 0.5) * 6.4;

          card.style.setProperty('--motion-tilt-x', `${tiltX.toFixed(2)}deg`);
          card.style.setProperty('--motion-tilt-y', `${tiltY.toFixed(2)}deg`);
          card.style.setProperty('--motion-glow-x', `${(x * 100).toFixed(1)}%`);
          card.style.setProperty('--motion-glow-y', `${(y * 100).toFixed(1)}%`);
        };

        const onCardLeave = () => {
          card.style.setProperty('--motion-tilt-x', '0deg');
          card.style.setProperty('--motion-tilt-y', '0deg');
          card.style.setProperty('--motion-glow-x', '50%');
          card.style.setProperty('--motion-glow-y', '50%');
        };

        card.addEventListener('pointermove', onCardMove, { passive: true });
        card.addEventListener('pointerleave', onCardLeave);
        cleanups.push(() => {
          card.removeEventListener('pointermove', onCardMove);
          card.removeEventListener('pointerleave', onCardLeave);
        });
      }

      for (const target of magneticTargets) {
        const onMagneticMove = (event: PointerEvent) => {
          const rect = target.getBoundingClientRect();
          const x = event.clientX - (rect.left + rect.width / 2);
          const y = event.clientY - (rect.top + rect.height / 2);
          target.style.setProperty(
            '--magnetic-x',
            `${clamp(x * 0.11, -8, 8).toFixed(2)}px`,
          );
          target.style.setProperty(
            '--magnetic-y',
            `${clamp(y * 0.12, -7, 7).toFixed(2)}px`,
          );
        };

        const onMagneticLeave = () => {
          target.style.setProperty('--magnetic-x', '0px');
          target.style.setProperty('--magnetic-y', '0px');
        };

        target.addEventListener('pointermove', onMagneticMove, { passive: true });
        target.addEventListener('pointerleave', onMagneticLeave);
        cleanups.push(() => {
          target.removeEventListener('pointermove', onMagneticMove);
          target.removeEventListener('pointerleave', onMagneticLeave);
        });
      }
    }

    return () => {
      observer?.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      window.removeEventListener('scroll', requestScrollUpdate);
      window.removeEventListener('resize', requestScrollUpdate);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      if (cursorFrame) window.cancelAnimationFrame(cursorFrame);
      parallaxLayers.forEach((layer) => layer.style.removeProperty('--parallax-y'));
      depthCards.forEach((card) => {
        card.style.removeProperty('--motion-tilt-x');
        card.style.removeProperty('--motion-tilt-y');
        card.style.removeProperty('--motion-glow-x');
        card.style.removeProperty('--motion-glow-y');
      });
      magneticTargets.forEach((target) => {
        target.style.removeProperty('--magnetic-x');
        target.style.removeProperty('--magnetic-y');
      });
      root.style.removeProperty('--motion-progress');
      root.style.removeProperty('--pointer-shift-x');
      root.style.removeProperty('--pointer-shift-y');
      root.classList.remove('motion-enabled');
      delete root.dataset.scrolled;
      delete root.dataset.reducedMotion;
    };
  }, []);

  return <div ref={cursorRef} className="motion-cursor" aria-hidden="true" />;
}
