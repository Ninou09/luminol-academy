'use client';

import { brandArtworkCredit, cinematicCopy } from '../lib/academy-media';
import type { Locale } from '@luminol/localization';
import type { EditorialFilmAsset } from '../lib/editorial-films';
import { useMotionAllowed } from '../lib/calm-mode';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import styles from './cinematic-backdrop.module.css';

type CinematicBackdropProps = {
  pauseLabel: string;
  playLabel: string;
  /** Defaults to the academy library film. */
  src?: string;
  poster?: string;
};

export function CinematicBackdrop({
  pauseLabel,
  playLabel,
  src = '/media/editorial/academy-film.mp4',
  poster = '/media/editorial/academy-poster.webp',
}: CinematicBackdropProps) {
  const library = src === '/media/editorial/academy-film.mp4';
  return (
    <div
      className={styles.backdrop}
      data-media-source={
        library
          ? 'https://mixkit.co/free-stock-video/a-hand-runs-through-the-book-spines-in-the-library-50726/'
          : brandArtworkCredit.source
      }
      data-media-secondary-source={
        library
          ? 'https://mixkit.co/free-stock-video/reverse-tour-of-a-library-full-of-books-21595/'
          : undefined
      }
      data-media-license={
        library ? 'Mixkit Stock Video Free License' : brandArtworkCredit.license
      }
      data-media-crop="center-center"
    >
      <Image className={styles.poster} src={poster} alt="" fill sizes="100vw" />
      <LoopVideo src={src} pauseLabel={pauseLabel} playLabel={playLabel} />
      <div className={styles.veil} />
    </div>
  );
}

/** Play while visible, with a poster for reduced motion and a persistent pause preference. */
function LoopVideo({
  src,
  pauseLabel,
  playLabel,
  editorial = false,
}: {
  src: string;
  pauseLabel: string;
  playLabel: string;
  editorial?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const allowMotion = useMotionAllowed();
  const [visible, setVisible] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(Boolean(entry?.isIntersecting));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (editorial || !allowMotion || !visible || userPaused || !video) return;
    video.muted = true;
    void video.play().catch(() => setPlaying(false));
  }, [allowMotion, editorial, userPaused, visible]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    setUserPaused(!video.paused);
    if (!video.paused) video.pause();
    else void video.play().catch(() => setPlaying(false));
  }

  return (
    <div ref={containerRef} className={styles.loop}>
      {allowMotion && visible && !failed ? (
        <>
          <video
            ref={videoRef}
            className={editorial ? styles.editorialVideo : styles.video}
            src={src}
            autoPlay={!userPaused}
            muted
            playsInline
            loop
            preload={editorial ? 'none' : 'metadata'}
            aria-hidden="true"
            onLoadStart={() => setPlaying(false)}
            onPlaying={(event) => {
              event.currentTarget.dataset.ready = 'true';
              setPlaying(true);
            }}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
          <button
            type="button"
            className={styles.control}
            aria-label={playing && !userPaused ? pauseLabel : playLabel}
            onClick={togglePlayback}
          >
            <span aria-hidden="true">{playing && !userPaused ? 'Ⅱ' : '▶︎'}</span>
          </button>
        </>
      ) : null}
    </div>
  );
}

export function EditorialFilm({
  className,
  locale,
  film,
  sizes,
}: {
  className?: string | undefined;
  locale: Locale;
  film: EditorialFilmAsset;
  sizes: string;
}) {
  const labels = cinematicCopy[locale];

  return (
    <figure
      className={[styles.editorial, className].filter(Boolean).join(' ')}
      data-media-source={film.source}
      data-media-license="Pexels License"
      data-media-crop="center-center"
      data-editorial-film
    >
      <Image
        className={styles.editorialPoster}
        src={film.poster}
        alt={film.alt[locale]}
        fill
        sizes={sizes}
      />
      <LoopVideo
        src={film.src}
        pauseLabel={labels.pause}
        playLabel={labels.play}
        editorial
      />
    </figure>
  );
}
