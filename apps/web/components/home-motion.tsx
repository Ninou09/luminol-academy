'use client';

import { useEffect } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function revealImmediately(elements: HTMLElement[]) {
  for (const element of elements) {
    element.dataset.revealed = 'true';
    element.querySelectorAll<HTMLElement>('[data-progress]').forEach((progress) => {
      progress.dataset.progressReady = 'true';
    });
  }
}

function setCounterValue(element: HTMLElement, value: number) {
  const suffix = element.dataset.countSuffix ?? '';
  element.textContent = `${Math.round(value)}${suffix}`;
}

function animateCounter(element: HTMLElement, reducedMotion: boolean) {
  if (element.dataset.countAnimated === 'true') return;

  const target = Number(element.dataset.count);
  if (!Number.isFinite(target)) return;

  element.dataset.countAnimated = 'true';

  if (reducedMotion) {
    setCounterValue(element, target);
    return;
  }

  const duration = 900;
  const start = performance.now();
  element.textContent = `0${element.dataset.countSuffix ?? ''}`;

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setCounterValue(element, target * eased);

    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

export function HomeMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    const counters = Array.from(
      document.querySelectorAll<HTMLElement>('[data-count]'),
    );

    root.classList.add('motion-enabled');

    const updateScrolledState = () => {
      root.dataset.scrolled = window.scrollY > 18 ? 'true' : 'false';
    };

    updateScrolledState();
    window.addEventListener('scroll', updateScrolledState, { passive: true });

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealImmediately(revealElements);
      counters.forEach((counter) => animateCounter(counter, true));
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
                element
                  .querySelectorAll<HTMLElement>('[data-count]')
                  .forEach((counter) => animateCounter(counter, false));
                element
                  .querySelectorAll<HTMLElement>('[data-progress]')
                  .forEach((progress) => {
                    progress.dataset.progressReady = 'true';
                  });
                observer?.unobserve(element);
              }
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
          );

    revealElements.forEach((element) => observer?.observe(element));

    const standaloneCounters = counters.filter(
      (counter) => !counter.closest('[data-reveal]'),
    );
    standaloneCounters.forEach((counter) => animateCounter(counter, reducedMotion));

    const heroVisual = document.querySelector<HTMLElement>('[data-hero-visual]');
    const updatePointer = (event: PointerEvent) => {
      if (!heroVisual || reducedMotion || window.innerWidth < 900) return;

      const bounds = heroVisual.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
      heroVisual.style.setProperty('--pointer-x', `${x.toFixed(2)}px`);
      heroVisual.style.setProperty('--pointer-y', `${y.toFixed(2)}px`);
    };
    const resetPointer = () => {
      heroVisual?.style.setProperty('--pointer-x', '0px');
      heroVisual?.style.setProperty('--pointer-y', '0px');
    };

    heroVisual?.addEventListener('pointermove', updatePointer, { passive: true });
    heroVisual?.addEventListener('pointerleave', resetPointer);

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', updateScrolledState);
      heroVisual?.removeEventListener('pointermove', updatePointer);
      heroVisual?.removeEventListener('pointerleave', resetPointer);
      root.classList.remove('motion-enabled');
      delete root.dataset.scrolled;
    };
  }, []);

  return null;
}
