'use client';

import { useEffect, useRef } from 'react';
import { useMotionAllowed } from '../lib/calm-mode';

export function FounderGold({ className }: { className?: string | undefined }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const allowed = useMotionAllowed();

  useEffect(() => {
    const canvas = ref.current;
    if (!allowed || !canvas) return;
    let visible = false;
    let pending = false;
    let stopped = false;
    let play: ((value: boolean) => void) | undefined;
    let dispose: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      play?.(visible);
      if (pending || !visible) return;
      pending = true;
      void import('./founder-gold-scene')
        .then(({ createFounderGold }) => {
          if (stopped) return;
          const scene = createFounderGold(canvas);
          play = scene?.play;
          dispose = scene?.dispose;
          play?.(visible);
        })
        .catch(() => {
          // The decorative gradient remains when WebGL is unavailable.
        });
    });
    observer.observe(canvas);
    return () => {
      stopped = true;
      observer.disconnect();
      dispose?.();
    };
  }, [allowed]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
