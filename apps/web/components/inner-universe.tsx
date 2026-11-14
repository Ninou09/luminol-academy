'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import type {
  InnerUniverse as Universe,
  UniverseThemeName,
} from './inner-universe-scene';

/** Which universe each route opens into. */
function themeFor(pathname: string): UniverseThemeName {
  const path = pathname.replace(/^\/(?:ar|fr|en)(?=\/|$)/, '') || '/';
  if (path === '/') return 'home';
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/consultations')) return 'consultations';
  if (path.startsWith('/contact')) return 'contact';
  if (path.startsWith('/programmes')) return 'programmes';
  if (path.startsWith('/schools/psychology')) return 'psychology';
  if (path.startsWith('/schools/languages')) return 'languages';
  if (path.startsWith('/schools/training')) return 'training';
  if (path.startsWith('/workshops')) return 'workshop';
  return 'home';
}

/**
 * Fixed full-viewport universe behind every page. Each page has its own
 * colours, objects and camera movement; scrolling moves through it and fast
 * scrolling briefly stretches space. Reduced motion keeps a CSS starfield.
 */
/** Phones, touch tablets and low-power devices get the lighter universe. */
function lightweightDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (
    window.matchMedia('(max-width: 760px)').matches ||
    window.matchMedia('(max-width: 1180px) and (pointer: coarse)').matches ||
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4
  );
}

export function InnerUniverse() {
  const pathname = usePathname();
  const theme = themeFor(pathname);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = canvasRef.current?.parentElement;
    if (!host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let universe: Universe | null = null;
    let disposed = false;
    let frame = 0;
    let lastY = window.scrollY;
    // A fresh canvas per universe avoids reusing a lost WebGL context.
    const canvas = document.createElement('canvas');
    host.append(canvas);

    const sync = () => {
      frame = 0;
      if (!universe) return;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      universe.setProgress(max > 0 ? y / max : 0);
      universe.setVelocity(y - lastY);
      lastY = y;
      frame = requestAnimationFrame(sync);
    };
    const onPointer = (event: PointerEvent) => {
      universe?.setPointer(
        (event.clientX / window.innerWidth - 0.5) * 2,
        (event.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    const onVisibility = () => {
      if (!universe) return;
      if (document.hidden) universe.stop();
      else universe.start();
    };

    const boot = async () => {
      const { createInnerUniverse, universeThemes } =
        await import('./inner-universe-scene');
      if (disposed) return;
      universe = createInnerUniverse(canvas, {
        mobile: lightweightDevice(),
        theme: universeThemes[theme],
      });
      if (!universe) return;
      universe.start();
      requestAnimationFrame(() => (canvas.dataset.live = 'true'));
      frame = requestAnimationFrame(sync);
    };
    const idle = window.setTimeout(() => void boot(), 300);

    // On phones, tilting the device gently moves the camera instead.
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      universe?.setPointer(
        Math.max(-1, Math.min(1, event.gamma / 30)),
        Math.max(-1, Math.min(1, (event.beta - 45) / 30)),
      );
    };
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (touch) {
      window.addEventListener('deviceorientation', onTilt, { passive: true });
    }
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disposed = true;
      window.clearTimeout(idle);
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onTilt);
      document.removeEventListener('visibilitychange', onVisibility);
      // Fade the old universe out while the next one fades in.
      delete canvas.dataset.live;
      const old = universe;
      window.setTimeout(() => {
        old?.destroy();
        canvas.remove();
      }, 900);
    };
  }, [theme]);

  return (
    <div className="inner-universe" aria-hidden="true" data-universe={theme}>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
