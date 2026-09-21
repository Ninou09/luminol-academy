'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import styles from './cinematic-backdrop.module.css';

type CinematicBackdropProps = {
  pauseLabel: string;
  playLabel: string;
};

type DataAwareNavigator = Navigator & {
  connection?: EventTarget & { saveData?: boolean };
};

export function CinematicBackdrop({
  pauseLabel,
  playLabel,
}: CinematicBackdropProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as DataAwareNavigator).connection;
    const syncPreference = () => {
      const allowed = !preference.matches && !connection?.saveData;
      if (!allowed) videoRef.current?.pause();
      setCanLoadVideo(allowed);
    };
    syncPreference();
    preference.addEventListener('change', syncPreference);
    connection?.addEventListener('change', syncPreference);
    return () => {
      preference.removeEventListener('change', syncPreference);
      connection?.removeEventListener('change', syncPreference);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canLoadVideo) return;

    let active = true;
    let inView = false;
    const shouldPlay = () =>
      active && inView && !document.hidden && !userPaused.current;
    const syncPlayback = () => {
      if (!shouldPlay()) {
        video.pause();
        return;
      }
      // Autoplay may be refused. Keep the poster and an explicit play button;
      // never retry on a timer or mistake a visibility pause for user intent.
      void video
        .play()
        .then(() => {
          if (!shouldPlay()) video.pause();
        })
        .catch(() => {
          if (active) setPlaying(false);
        });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        syncPlayback();
      },
      { threshold: 0 },
    );

    observer.observe(video);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      active = false;
      video.pause();
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [canLoadVideo]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      userPaused.current = false;
      try {
        await video.play();
      } catch {
        setPlaying(false);
      }
    } else {
      userPaused.current = true;
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      data-media-source="https://mixkit.co/free-stock-video/a-hand-runs-through-the-book-spines-in-the-library-50726/"
      data-media-secondary-source="https://mixkit.co/free-stock-video/reverse-tour-of-a-library-full-of-books-21595/"
      data-media-license="Mixkit Stock Video Free License"
      data-media-crop="center-center"
    >
      <Image
        className={styles.poster}
        src="/media/editorial/academy-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
      />
      <video
        ref={videoRef}
        className={styles.video}
        src={canLoadVideo ? '/media/editorial/academy-film.mp4' : undefined}
        poster="/media/editorial/academy-poster.webp"
        muted
        aria-hidden="true"
        preload="none"
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setCanLoadVideo(false)}
      />
      <div className={styles.veil} />
      {canLoadVideo ? (
        <button
          className={styles.control}
          type="button"
          aria-label={playing ? pauseLabel : playLabel}
          onClick={togglePlayback}
        >
          <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
        </button>
      ) : null}
    </div>
  );
}
