'use client';

import { useEffect } from 'react';

/** Native scrolling drives the film framing; no pinned scroll or render loop. */
export function CinematicScroll() {
  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const reset = () => {
      for (const name of [
        '--scene-y',
        '--scene-scale',
        '--scene-copy-y',
        '--scene-inset',
      ])
        hero.style.removeProperty(name);
    };
    const paint = () => {
      frame = 0;
      if (preference.matches) return;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      hero.style.setProperty('--scene-y', `${progress * 55}px`);
      hero.style.setProperty('--scene-scale', `${1.04 + progress * 0.07}`);
      hero.style.setProperty('--scene-copy-y', `${progress * -30}px`);
      hero.style.setProperty('--scene-inset', `${progress * 2}%`);
    };
    const schedule = () => {
      if (!frame && !preference.matches) frame = requestAnimationFrame(paint);
    };
    const syncPreference = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      reset();
      schedule();
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    preference.addEventListener('change', syncPreference);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', syncPreference);
      reset();
    };
  }, []);
  return null;
}
