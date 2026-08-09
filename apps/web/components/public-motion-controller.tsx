'use client';

import { useEffect } from 'react';

type MotionMode = 'full' | 'reduced';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function revealImmediately(elements: HTMLElement[]) {
  for (const element of elements) {
    element.dataset.revealState = 'visible';
  }
}

export function PublicMotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia(reducedMotionQuery);
    let observer: IntersectionObserver | null = null;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );

    const disconnectObserver = () => {
      observer?.disconnect();
      observer = null;
    };

    const applyMode = (mode: MotionMode) => {
      disconnectObserver();
      root.dataset.motion = mode;

      if (mode === 'reduced' || !('IntersectionObserver' in window)) {
        revealImmediately(elements);
        root.dataset.motionReady = 'true';
        return;
      }

      for (const element of elements) {
        element.dataset.revealState = 'pending';
      }
      root.dataset.motionReady = 'true';

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const target = entry.target as HTMLElement;
            target.dataset.revealState = 'visible';
            observer?.unobserve(target);
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      );

      for (const element of elements) observer.observe(element);
    };

    const syncMotionPreference = () => {
      applyMode(media.matches ? 'reduced' : 'full');
    };

    syncMotionPreference();
    media.addEventListener('change', syncMotionPreference);

    return () => {
      media.removeEventListener('change', syncMotionPreference);
      disconnectObserver();
      delete root.dataset.motion;
      delete root.dataset.motionReady;
      for (const element of elements) delete element.dataset.revealState;
    };
  }, []);

  return null;
}
