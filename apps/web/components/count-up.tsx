'use client';

import { useMotionAllowed } from '../lib/calm-mode';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Numbers marked with [data-count] count up once when they scroll into view.
 * The final text is already in the HTML, so nothing changes for readers
 * without JavaScript or with reduced motion.
 */
export function CountUp() {
  const pathname = usePathname();
  const allowMotion = useMotionAllowed();
  useEffect(() => {
    if (!allowMotion) return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-count]'),
    );
    const originals = elements.map((element) => element.textContent);
    const frames: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          const final = element.textContent ?? '';
          const target = Number(element.dataset.count);
          if (!Number.isFinite(target) || target <= 0) continue;
          const suffix = final.replace(/^\d+/, '');
          const started = performance.now();
          const duration = 1400;
          const tick = (now: number) => {
            const t = Math.min(1, (now - started) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            element.textContent = `${Math.round(target * eased)}${suffix}`;
            if (t < 1) frames.push(requestAnimationFrame(tick));
            else element.textContent = final;
          };
          frames.push(requestAnimationFrame(tick));
        }
      },
      { threshold: 0.6 },
    );
    for (const element of elements) observer.observe(element);
    return () => {
      observer.disconnect();
      elements.forEach((element, i) => {
        element.textContent = originals[i] ?? null;
      });
      for (const frame of frames) cancelAnimationFrame(frame);
    };
  }, [pathname, allowMotion]);
  return null;
}
