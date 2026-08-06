'use client';

import { useEffect } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function revealImmediately(elements: HTMLElement[]) {
  for (const element of elements) {
    element.dataset.revealed = 'true';
  }
}

export function HomeMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );

    root.classList.add('motion-enabled');

    const updateScrolledState = () => {
      root.dataset.scrolled = window.scrollY > 18 ? 'true' : 'false';
    };

    updateScrolledState();
    window.addEventListener('scroll', updateScrolledState, { passive: true });

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
            { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
          );

    revealElements.forEach((element) => observer?.observe(element));

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', updateScrolledState);
      root.classList.remove('motion-enabled');
      delete root.dataset.scrolled;
    };
  }, []);

  return null;
}
