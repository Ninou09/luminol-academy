'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { getProgrammeSlugFromPathname } from '../lib/programme-enquiry';

type MotionMode = 'full' | 'reduced';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const localizedContactPath = /^\/(?:ar|fr|en)\/contact\/?$/;

function revealImmediately(elements: HTMLElement[]) {
  for (const element of elements) {
    element.dataset.revealState = 'visible';
  }
}

function addProgrammeContext(anchor: HTMLAnchorElement, slug: string) {
  const href = anchor.getAttribute('href');
  if (!href) return;

  const url = new URL(href, window.location.origin);
  if (
    url.origin !== window.location.origin ||
    !localizedContactPath.test(url.pathname)
  ) {
    return;
  }

  url.searchParams.set('programme', slug);
  anchor.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
  anchor.dataset.programmeEnquiry = 'true';
}

function decorateProgrammeEnquiryLinks(pathname: string) {
  const detailSlug = getProgrammeSlugFromPathname(pathname);
  if (detailSlug) {
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>(
      'main a[href]',
    )) {
      addProgrammeContext(anchor, detailSlug);
    }
  }

  for (const card of document.querySelectorAll<HTMLElement>(
    '[data-programme-card]',
  )) {
    const programmeLink = Array.from(
      card.querySelectorAll<HTMLAnchorElement>('a[href]'),
    ).find((anchor) => {
      const href = anchor.getAttribute('href');
      if (!href) return false;
      const url = new URL(href, window.location.origin);
      return getProgrammeSlugFromPathname(url.pathname) !== null;
    });

    if (!programmeLink) continue;
    const programmeUrl = new URL(programmeLink.href, window.location.origin);
    const slug = getProgrammeSlugFromPathname(programmeUrl.pathname);
    if (!slug) continue;

    for (const anchor of card.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      addProgrammeContext(anchor, slug);
    }
  }
}

export function PublicMotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia(reducedMotionQuery);
    let observer: IntersectionObserver | null = null;

    decorateProgrammeEnquiryLinks(pathname);

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );

    const disconnectObserver = () => {
      observer?.disconnect();
      observer = null;
    };

    const applyMode = (mode: MotionMode) => {
      disconnectObserver();
      root.dataset.motion = mode;

      if (mode === 'reduced' || !('IntersectionObserver' in window)) {
        revealImmediately(elements);
        root.dataset.motionReady = 'true';
        return;
      }

      for (const element of elements) {
        element.dataset.revealState = 'pending';
      }
      root.dataset.motionReady = 'true';

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const target = entry.target as HTMLElement;
            target.dataset.revealState = 'visible';
            observer?.unobserve(target);
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      );

      for (const element of elements) observer.observe(element);
    };

    const syncMotionPreference = () => {
      applyMode(media.matches ? 'reduced' : 'full');
    };

    syncMotionPreference();
    media.addEventListener('change', syncMotionPreference);

    return () => {
      media.removeEventListener('change', syncMotionPreference);
      disconnectObserver();
      delete root.dataset.motion;
      delete root.dataset.motionReady;
      for (const element of elements) delete element.dataset.revealState;
    };
  }, [pathname]);

  return null;
}
