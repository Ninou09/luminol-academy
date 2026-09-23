'use client';

import type { Locale } from '@luminol/localization';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './learning-film.module.css';

const copy = {
  en: {
    play: 'Play learning moment',
    pause: 'Pause learning moment',
    alt: 'A close-up of a person making notes in a notebook',
    caption: 'Stock film · Illustrative scene · No audio',
  },
  fr: {
    play: 'Lire le moment d’apprentissage',
    pause: 'Mettre la vidéo en pause',
    alt: 'Gros plan d’une personne prenant des notes dans un carnet',
    caption: 'Vidéo de banque d’images · Scène illustrative · Sans son',
  },
  ar: {
    play: 'تشغيل لحظة تعلّم',
    pause: 'إيقاف الفيديو مؤقتاً',
    alt: 'لقطة مقرّبة لشخص يدوّن ملاحظات في دفتر',
    caption: 'فيديو من مكتبة مقاطع · مشهد توضيحي · بلا صوت',
  },
} as const;

/** A lightweight detail film. Mobile, data saving and reduced motion keep the poster until requested. */
export function LearningFilm({
  locale,
  className,
}: {
  locale: Locale;
  className?: string | undefined;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const userRequestedPlayback = useRef(false);
  const [playing, setPlaying] = useState(false);
  const labels = copy[locale];

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 1000px)');
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const canPlay = () =>
      !userPaused.current &&
      (userRequestedPlayback.current ||
        (!reduce.matches && !mobile.matches && !connection?.saveData));
    const play = () => {
      if (!element.getAttribute('src'))
        element.src = '/media/stock/notebook.mp4';
      void element.play().catch(() => setPlaying(false));
    };
    let visible = false;
    let frame = 0;
    const isUncovered = () => {
      const bounds = element.getBoundingClientRect();
      const left = Math.max(0, bounds.left);
      const right = Math.min(window.innerWidth, bounds.right);
      const top = Math.max(0, bounds.top);
      const bottom = Math.min(window.innerHeight, bounds.bottom);
      if (right <= left || bottom <= top) return false;
      const hit = document.elementFromPoint(
        (left + right) / 2,
        (top + bottom) / 2,
      );
      return Boolean(hit && element.parentElement?.contains(hit));
    };
    const sync = () => {
      // IntersectionObserver alone treats a film beneath another sticky card as visible.
      if (visible && !document.hidden && canPlay() && isUncovered()) {
        if (element.paused) play();
      } else element.pause();
    };
    const schedule = () => {
      if (!visible || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };
    const syncPreference = () => {
      userRequestedPlayback.current = false;
      sync();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(
          entry?.isIntersecting && entry.intersectionRatio >= 0.3,
        );
        sync();
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    reduce.addEventListener('change', syncPreference);
    mobile.addEventListener('change', syncPreference);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('toggle', sync, true);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.pause();
      reduce.removeEventListener('change', syncPreference);
      mobile.removeEventListener('change', syncPreference);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', sync);
      document.removeEventListener('toggle', sync, true);
    };
  }, []);

  function toggle() {
    const element = video.current;
    if (!element) return;
    if (!element.paused) {
      userPaused.current = true;
      userRequestedPlayback.current = false;
      element.pause();
    } else {
      userPaused.current = false;
      userRequestedPlayback.current = true;
      if (!element.getAttribute('src'))
        element.src = '/media/stock/notebook.mp4';
      void element.play().catch(() => setPlaying(false));
    }
  }

  return (
    <figure
      className={`${styles.film} ${className ?? ''}`}
      data-learning-film
      data-media-source="https://www.pexels.com/video/writing-on-a-notebook-7192325/"
      data-media-license="Pexels License"
    >
      <Image
        src="/media/stock/notebook-poster.webp"
        alt={labels.alt}
        fill
        sizes="(max-width: 700px) 100vw, 55vw"
        className={styles.poster}
      />
      <video
        ref={video}
        poster="/media/stock/notebook-poster.webp"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className={styles.video}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        className={styles.toggle}
        aria-label={playing ? labels.pause : labels.play}
        aria-pressed={playing}
      >
        <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
        {playing ? labels.pause : labels.play}
      </button>
      <figcaption>{labels.caption}</figcaption>
    </figure>
  );
}
