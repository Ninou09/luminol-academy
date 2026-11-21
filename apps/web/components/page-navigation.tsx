'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

type LenisLike = { stop: () => void; scrollTo: (target: number) => void };

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
    // Clicking a page link stops any smooth-scroll momentum right away, so
    // the next page cannot inherit it. Clicking the current page's own link
    // simply glides back to the top.
    const onLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash) return;
      const lenis = (window as Window & { __luminolLenis?: LenisLike })
        .__luminolLenis;
      if (url.pathname === window.location.pathname) {
        // Filter links on the same page keep the visitor where they are.
        if (url.search !== window.location.search) return;
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      lenis?.stop();
    };
    document.addEventListener('click', onLinkClick, true);
    return () => {
      document.removeEventListener('click', onLinkClick, true);
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
