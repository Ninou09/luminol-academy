'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Site-wide chrome motion:
 * - a luminous reading-progress line at the top of the viewport
 * - html[data-scroll-dir] so the header can step aside while reading down
 * - a short light curtain between client-side page transitions
 */
export function SiteChrome() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const firstPath = useRef(pathname);
  const [curtainKey, setCurtainKey] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    let last = window.scrollY;
    let frame = 0;
    const paint = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      barRef.current?.style.setProperty(
        '--scroll-progress',
        max > 0 ? (y / max).toFixed(4) : '0',
      );
      if (Math.abs(y - last) > 6) {
        root.dataset.scrollDir = y > last && y > 240 ? 'down' : 'up';
        last = y;
      }
      if (y > 24) root.dataset.scrolled = '';
      else delete root.dataset.scrolled;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    // Focus moving into the header (keyboard users) always reveals it.
    const reveal = (event: FocusEvent) => {
      if ((event.target as Element | null)?.closest('header'))
        root.dataset.scrollDir = 'up';
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('focusin', reveal);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', reveal);
      delete root.dataset.scrollDir;
      delete root.dataset.scrolled;
    };
  }, []);

  // Play the curtain only for client-side navigations, never on first load.
  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = pathname;
    document.documentElement.dataset.scrollDir = 'up';
    setCurtainKey(pathname);
    const timer = window.setTimeout(() => setCurtainKey(null), 950);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div ref={barRef} className="scroll-progress" aria-hidden="true" />
      {curtainKey ? (
        <div key={curtainKey} className="route-curtain" aria-hidden="true" />
      ) : null}
    </>
  );
}
