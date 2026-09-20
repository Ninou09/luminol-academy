'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

/** New pages start at the beginning; intentional section links keep their target. */
export function PageNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const resetRestoredPage = () => {
      if (!window.location.hash)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    window.addEventListener('pageshow', resetRestoredPage);
    return () => {
      window.history.scrollRestoration = previous;
      window.removeEventListener('pageshow', resetRestoredPage);
    };
  }, []);

  useLayoutEffect(() => {
    if (window.location.hash) return;
    const reset = () =>
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    reset();
    // Next also handles scrolling after commit. Apply the page rule after that
    // pass, without delays that could pull a user back after they start reading.
    const frame = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
