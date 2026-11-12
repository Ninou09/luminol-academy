'use client';

import { useEffect, useRef } from 'react';

import type { MindScene } from './mind-scene';

/**
 * Compact, self-playing version of the neuron brain for inner-page heroes:
 * it gathers from stars on arrival, then keeps thinking quietly and follows
 * the pointer. Decorative; reduced motion keeps the hero as it was.
 */
export function NeuralBrain({ className }: { className?: string | undefined }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let scene: MindScene | null = null;
    let disposed = false;
    let frame = 0;
    let startedAt = 0;

    const tick = (now: number) => {
      if (!scene) return;
      if (!startedAt) startedAt = now;
      // Assemble over ~3.5 s, then rest in the "thinking" state.
      const t = Math.min(1, (now - startedAt) / 3500);
      scene.setProgress(0.62 * (1 - Math.pow(1 - t, 3)));
      frame = t < 1 ? requestAnimationFrame(tick) : 0;
    };
    const onPointer = (event: PointerEvent) => {
      scene?.setPointer(
        (event.clientX / window.innerWidth - 0.5) * 2,
        (event.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    const visibility = new IntersectionObserver(([entry]) => {
      if (!scene) return;
      if (entry?.isIntersecting && !document.hidden) scene.start();
      else scene.stop();
    });

    void (async () => {
      const { createMindScene } = await import('./mind-scene');
      if (disposed) return;
      scene = createMindScene(canvas, {
        mobile: window.matchMedia('(max-width: 760px)').matches,
        compact: true,
      });
      if (!scene) return;
      canvas.dataset.live = 'true';
      scene.start();
      frame = requestAnimationFrame(tick);
      visibility.observe(canvas);
    })();
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      visibility.disconnect();
      window.removeEventListener('pointermove', onPointer);
      scene?.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
