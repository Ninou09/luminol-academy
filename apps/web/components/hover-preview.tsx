'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import styles from './hover-preview.module.css';

/**
 * Links marked with [data-preview-src] reveal a floating artwork that trails
 * the pointer and leans with its speed. Decorative: the link text carries the
 * meaning, so the preview is hidden from assistive technology.
 */
export function HoverPreview() {
  const pathname = usePathname();
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const image = imageRef.current;
    if (!frame || !image) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || motion.matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    let active = false;

    const loop = () => {
      const dx = target.x - current.x;
      current.x += dx * 0.14;
      current.y += (target.y - current.y) * 0.14;
      const lean = Math.max(-14, Math.min(14, dx * 0.12));
      frame.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) rotate(${lean}deg)`;
      raf = active || Math.abs(dx) > 0.5 ? requestAnimationFrame(loop) : 0;
    };

    const links = Array.from(
      document.querySelectorAll<HTMLElement>('[data-preview-src]'),
    );
    const enter = (event: PointerEvent) => {
      const link = event.currentTarget as HTMLElement;
      const src = link.dataset.previewSrc;
      if (!src) return;
      if (image.getAttribute('src') !== src) image.src = src;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!active) {
        current.x = target.x;
        current.y = target.y;
      }
      active = true;
      frame.dataset.visible = 'true';
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const move = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };
    const leave = () => {
      active = false;
      delete frame.dataset.visible;
    };
    for (const link of links) {
      link.addEventListener('pointerenter', enter);
      link.addEventListener('pointermove', move, { passive: true });
      link.addEventListener('pointerleave', leave);
    }
    return () => {
      cancelAnimationFrame(raf);
      for (const link of links) {
        link.removeEventListener('pointerenter', enter);
        link.removeEventListener('pointermove', move);
        link.removeEventListener('pointerleave', leave);
      }
      leave();
    };
  }, [pathname]);

  return (
    <div ref={frameRef} className={styles.frame} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- src swaps on hover */}
      <img ref={imageRef} className={styles.image} alt="" decoding="async" />
    </div>
  );
}
