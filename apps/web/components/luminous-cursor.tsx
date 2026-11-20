'use client';

import { useEffect, useRef } from 'react';

import styles from './luminous-cursor.module.css';

const interactive =
  'a, button, [role="button"], input, textarea, select, label, [data-tilt]';

/**
 * A soft luminous aura that trails the native pointer (which stays visible).
 * It swells over interactive elements and is skipped on touch and for
 * reduced motion.
 */
export function LuminousCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (motion.matches || !fine.matches) return;

    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let frame = 0;
    let visible = false;

    const paint = () => {
      ringPos.x += (target.x - ringPos.x) * 0.16;
      ringPos.y += (target.y - ringPos.y) * 0.16;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      frame = requestAnimationFrame(paint);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = target.x;
        ringPos.y = target.y;
        document.documentElement.dataset.cursor = 'on';
      }
      const hovered = (event.target as Element | null)?.closest(interactive);
      ring.dataset.hover = hovered ? 'true' : 'false';
    };
    const onLeave = () => {
      visible = false;
      delete document.documentElement.dataset.cursor;
    };
    const onDown = () => (ring.dataset.press = 'true');
    const onUp = () => (ring.dataset.press = 'false');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    frame = requestAnimationFrame(paint);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      delete document.documentElement.dataset.cursor;
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className={styles.ring} aria-hidden="true" />
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
}
