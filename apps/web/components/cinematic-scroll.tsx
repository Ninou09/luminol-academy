'use client';

import { useEffect } from 'react';

/** Native scrolling drives the film framing; no pinned scroll or render loop. */
export function CinematicScroll() {
  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1001px)');
    const scenes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-depth-scene]'),
    );
    let frame = 0;
    const reset = () => {
      for (const name of [
        '--scene-y',
        '--scene-scale',
        '--scene-copy-y',
        '--scene-inset',
      ])
        hero.style.removeProperty(name);
      scenes.forEach((scene) => scene.style.removeProperty('--depth-progress'));
    };
    const paint = () => {
      frame = 0;
      if (preference.matches) return;
      const rect = hero.getBoundingClientRect();
      const measures = desktop.matches
        ? scenes.map((scene) => ({
            scene,
            rect: scene.getBoundingClientRect(),
          }))
        : [];
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
        hero.style.setProperty('--scene-y', `${progress * 55}px`);
        hero.style.setProperty('--scene-scale', `${1.04 + progress * 0.07}`);
        hero.style.setProperty('--scene-copy-y', `${progress * -30}px`);
        hero.style.setProperty('--scene-inset', `${progress * 2}%`);
      }
      for (const { scene, rect: bounds } of measures) {
        if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) continue;
        const depth =
          (window.innerHeight / 2 - bounds.top - bounds.height / 2) /
          window.innerHeight;
        scene.style.setProperty(
          '--depth-progress',
          Math.max(-1, Math.min(1, depth * 2)).toFixed(3),
        );
      }
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
    desktop.addEventListener('change', syncPreference);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', syncPreference);
      desktop.removeEventListener('change', syncPreference);
      reset();
    };
  }, []);
  return null;
}
