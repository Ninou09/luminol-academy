'use client';

import type { Locale } from '@luminol/localization';
import { getImageProps } from 'next/image';
import { useEffect, useRef } from 'react';

import { brandArtwork, brandArtworkCredit } from '../lib/academy-media';
import { createLuminousField, type ArtworkFrame } from './luminous-field';
import styles from './luminous-backdrop.module.css';

type DataAwareNavigator = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
};

/** Keep in sync with the <source media> below. */
const portraitQuery = '(max-width: 760px) and (orientation: portrait)';

const desktopFrame: ArtworkFrame = {
  aspect: brandArtwork.heroDesktop.width / brandArtwork.heroDesktop.height,
  anchor: { x: 0.7, y: 0.475, radius: 0.233 },
};
const portraitFrame: ArtworkFrame = {
  aspect: brandArtwork.heroMobile.width / brandArtwork.heroMobile.height,
  anchor: { x: 0.5, y: 0.25, radius: 0.37 },
};

export function LuminousBackdrop({ locale }: { locale: Locale }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const hero = root?.closest<HTMLElement>('#top') ?? root;
    if (!root || !canvas || !hero) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const portrait = window.matchMedia(portraitQuery);
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const connection = (navigator as DataAwareNavigator).connection;
    if (motion.matches || connection?.saveData) return;

    const field = createLuminousField(canvas);
    if (!field) return;
    root.dataset.field = 'live';

    let inView = true;
    let frame = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const syncFrame = () =>
      field.setFrame(portrait.matches ? portraitFrame : desktopFrame);
    const syncRunning = () => {
      if (inView && !document.hidden && !motion.matches) field.start();
      else field.stop();
    };

    // Ease the 3D parallax so the scene feels weighty rather than twitchy.
    const paint = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      hero.style.setProperty('--hero-px', current.x.toFixed(4));
      hero.style.setProperty('--hero-py', current.y.toFixed(4));
      frame =
        Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.001
          ? requestAnimationFrame(paint)
          : 0;
    };
    const onPointerMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      const direction = document.dir === 'rtl' ? -1 : 1;
      target.x =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2 * direction;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      field.setPointer(target.x * direction, -target.y);
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
      field.setPointer(0, 0);
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      syncRunning();
    });
    observer.observe(hero);

    syncFrame();
    syncRunning();
    portrait.addEventListener('change', syncFrame);
    motion.addEventListener('change', syncRunning);
    document.addEventListener('visibilitychange', syncRunning);
    if (finePointer.matches) {
      hero.addEventListener('pointermove', onPointerMove, { passive: true });
      hero.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      portrait.removeEventListener('change', syncFrame);
      motion.removeEventListener('change', syncRunning);
      document.removeEventListener('visibilitychange', syncRunning);
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
      hero.style.removeProperty('--hero-px');
      hero.style.removeProperty('--hero-py');
      field.destroy();
      delete root.dataset.field;
    };
  }, []);

  const desktop = brandArtwork.heroDesktop;
  const portrait = brandArtwork.heroMobile;
  const {
    props: { srcSet: portraitSrcSet },
  } = getImageProps({
    src: portrait.src,
    alt: '',
    width: portrait.width,
    height: portrait.height,
    sizes: '100vw',
    quality: 82,
  });
  const { props: desktopProps } = getImageProps({
    src: desktop.src,
    alt: desktop.alt[locale],
    width: desktop.width,
    height: desktop.height,
    sizes: '100vw',
    quality: 82,
    priority: true,
  });

  return (
    <div
      ref={rootRef}
      className={styles.backdrop}
      data-media-source={brandArtworkCredit.source}
      data-media-license={brandArtworkCredit.license}
      data-media-crop="sphere-right"
    >
      <div className={styles.scene}>
        <picture>
          <source media={portraitQuery} srcSet={portraitSrcSet} />
          <img
            {...desktopProps}
            className={styles.art}
            alt={desktopProps.alt}
          />
        </picture>
        <canvas ref={canvasRef} className={styles.field} aria-hidden="true" />
      </div>
      <div className={styles.veil} />
      <div className={styles.grain} />
    </div>
  );
}
