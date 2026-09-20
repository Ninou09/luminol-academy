'use client';

import { useEffect } from 'react';

/** Event-driven transforms: no render loop, scroll interception or React updates. */
export function CinematicScroll() {
  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const reset = () => {
      hero.style.removeProperty('--scene-y');
      hero.style.removeProperty('--scene-scale');
    };
    const paint = () => {
      frame = 0;
      if (preference.matches) return;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      hero.style.setProperty('--scene-y', `${progress * 70}px`);
      hero.style.setProperty('--scene-scale', `${1.06 + progress * 0.08}`);
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
