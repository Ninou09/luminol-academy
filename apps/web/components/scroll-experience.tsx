'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger, SplitText);

declare global {
  interface Window {
    /** Shared with other effects (marquee velocity, constellation). */
    __luminolLenis?: Lenis;
  }
}

/**
 * Scroll choreography declared with data attributes, so pages stay server
 * components:
 * - [data-split]        heading words rise out of masked lines
 * - [data-depth]        element drifts at a scroll speed (e.g. "0.15")
 * - [data-flip-in]      3D card swing into place as it enters
 * - [data-stagger]      children enter one after another in 3D
 * - [data-hero-exit]    hero copy dissolves upward while leaving
 *
 * Everything lives inside gsap.matchMedia, so a reduced-motion preference
 * reverts every split, inline style and trigger automatically.
 */
export function ScrollExperience() {
  const pathname = usePathname();

  // Smooth scrolling for wheel and trackpad only; touch keeps native physics.
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (motion.matches || !finePointer.matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.95,
      anchors: { offset: -96 },
      autoRaf: false,
    });
    window.__luminolLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const stopOnReduce = () => {
      if (motion.matches) lenis.destroy();
    };
    motion.addEventListener('change', stopOnReduce);
    return () => {
      motion.removeEventListener('change', stopOnReduce);
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__luminolLenis;
    };
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const rtl = document.documentElement.dir === 'rtl';

      // Explicit [data-split] plus every page heading, site-wide.
      const headings = new Set(
        document.querySelectorAll<HTMLElement>(
          '[data-split], main h1:not([data-no-split]), main h2:not([data-no-split])',
        ),
      );
      for (const heading of headings) {
        if (heading.closest('[data-no-split]')) continue;
        // Words, not characters: Arabic letters must stay joined.
        const split = SplitText.create(heading, {
          type: 'lines,words',
          mask: 'lines',
          aria: 'auto',
          linesClass: 'split-line',
        });
        gsap.from(split.words, {
          yPercent: 115,
          rotateX: -40,
          opacity: 0,
          transformOrigin: '50% 100%',
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.06,
          scrollTrigger: { trigger: heading, start: 'top 86%', once: true },
        });
      }

      // Key paragraphs light up word by word in step with the scroll.
      for (const paragraph of document.querySelectorAll<HTMLElement>(
        '[data-scrub-text]',
      )) {
        const split = SplitText.create(paragraph, {
          type: 'words',
          aria: 'auto',
        });
        gsap.fromTo(
          split.words,
          { opacity: 0.16, filter: 'blur(2px)' },
          {
            opacity: 1,
            filter: 'blur(0px)',
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: {
              trigger: paragraph,
              start: 'top 85%',
              end: 'bottom 45%',
              scrub: true,
            },
          },
        );
      }

      // Editorial images open like a window and settle into focus.
      for (const figure of document.querySelectorAll<HTMLElement>(
        'main figure:not([data-tilt]):not([data-no-reveal])',
      )) {
        if (figure.closest('#top, [data-flip-in]')) continue;
        const image = figure.querySelector('img');
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: figure, start: 'top 88%', once: true },
        });
        timeline.fromTo(
          figure,
          { clipPath: 'inset(14% 10% 14% 10%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            ease: 'expo.out',
            clearProps: 'clipPath',
          },
        );
        if (image)
          timeline.fromTo(
            image,
            { scale: 1.25 },
            { scale: 1, duration: 1.8, ease: 'expo.out', clearProps: 'scale' },
            0,
          );
      }

      // Portal bands open from a glowing circle; curtain bands part outward.
      for (const band of document.querySelectorAll<HTMLElement>(
        '[data-band-reveal="portal"]',
      )) {
        gsap.fromTo(
          band,
          { clipPath: 'circle(14% at 50% 50%)' },
          {
            clipPath: 'circle(78% at 50% 50%)',
            ease: 'none',
            scrollTrigger: {
              trigger: band,
              start: 'top 85%',
              end: 'center 45%',
              scrub: 0.6,
            },
          },
        );
      }
      for (const band of document.querySelectorAll<HTMLElement>(
        '[data-band-reveal="curtain"]',
      )) {
        gsap.fromTo(
          band,
          { clipPath: 'inset(0% 46% 0% 46% round 2rem)' },
          {
            clipPath: 'inset(0% 0% 0% 0% round 2rem)',
            ease: 'none',
            scrollTrigger: {
              trigger: band,
              start: 'top 88%',
              end: 'center 50%',
              scrub: 0.6,
            },
          },
        );
      }

      // Cinematic bands: the camera slowly pushes in while scrolling past.
      for (const layer of document.querySelectorAll<HTMLElement>(
        '[data-zoom]',
      )) {
        gsap.fromTo(
          layer,
          { scale: 1.22, yPercent: -6 },
          {
            scale: 1,
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: layer.parentElement ?? layer,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      }

      // Lists of cards across every page enter one after another.
      for (const list of document.querySelectorAll<HTMLElement>(
        'main ul, main ol',
      )) {
        const items = Array.from(list.children) as HTMLElement[];
        if (items.length < 2 || items.length > 14) continue;
        if (list.closest('[data-stagger], #top, [data-no-split], nav'))
          continue;
        if (
          list.querySelector('[data-reveal]') ||
          list.hasAttribute('data-reveal')
        )
          continue;
        if (list.closest('[aria-labelledby="constellation-title"]')) continue;
        gsap.from(items, {
          y: 36,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.07,
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: list, start: 'top 88%', once: true },
        });
      }

      for (const element of document.querySelectorAll<HTMLElement>(
        '[data-depth]',
      )) {
        const speed = Number(element.dataset.depth) || 0.12;
        gsap.fromTo(
          element,
          { yPercent: speed * 100 },
          {
            yPercent: -speed * 100,
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      }

      for (const card of document.querySelectorAll<HTMLElement>(
        '[data-flip-in]',
      )) {
        const fromEnd = card.dataset.flipIn === 'end';
        const swing = (fromEnd ? -1 : 1) * (rtl ? -1 : 1) * 24;
        gsap.fromTo(
          card,
          {
            rotateY: swing,
            rotateX: 14,
            z: -260,
            opacity: 0,
            transformPerspective: 1300,
          },
          {
            rotateY: 0,
            rotateX: 0,
            z: 0,
            opacity: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              end: 'top 38%',
              scrub: 0.8,
            },
          },
        );
      }

      for (const group of document.querySelectorAll<HTMLElement>(
        '[data-stagger]',
      )) {
        gsap.from(group.children, {
          y: 70,
          rotateX: -35,
          opacity: 0,
          transformPerspective: 900,
          transformOrigin: '50% 0%',
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: { trigger: group, start: 'top 82%', once: true },
        });
      }

      for (const element of document.querySelectorAll<HTMLElement>(
        '[data-hero-exit]',
      )) {
        gsap.to(element, {
          yPercent: -18,
          opacity: 0,
          filter: 'blur(10px)',
          ease: 'none',
          scrollTrigger: {
            trigger: element.closest('section') ?? element,
            start: 'top top',
            end: 'bottom 35%',
            scrub: true,
          },
        });
      }

      // Fonts and images change layout after hydration; measure again.
      const refresh = () => ScrollTrigger.refresh();
      void document.fonts?.ready.then(refresh);
      window.addEventListener('load', refresh, { once: true });
      return () => window.removeEventListener('load', refresh);
    });

    return () => mm.revert();
  }, [pathname]);

  // Smooth scroller restarts at the top of every new page.
  useEffect(() => {
    if (!window.location.hash)
      window.__luminolLenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
