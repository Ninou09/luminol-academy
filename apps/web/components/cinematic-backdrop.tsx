'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import styles from './cinematic-backdrop.module.css';

type CinematicBackdropProps = {
  pauseLabel: string;
  playLabel: string;
  filmNote: string;
};

type DataAwareNavigator = Navigator & {
  connection?: Partial<EventTarget> & { saveData?: boolean };
};

export function CinematicBackdrop({
  pauseLabel,
  playLabel,
  filmNote,
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
    connection?.addEventListener?.('change', syncPreference);
    return () => {
      preference.removeEventListener('change', syncPreference);
      connection?.removeEventListener?.('change', syncPreference);
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
      data-media-source="https://www.pexels.com/video/people-discussing-while-studying-together-6672571/"
      data-media-license="Pexels License"
      data-media-crop="center-center; cover; unmirrored in RTL"
      data-media-publication-approved="true"
    >
      <Image
        className={styles.poster}
        src="/media/editorial/academy-community-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
      />
      {canLoadVideo ? (
        <video
          ref={videoRef}
          className={styles.video}
          src="/media/editorial/academy-community-film.mp4"
          poster="/media/editorial/academy-community-poster.webp"
          muted
          aria-hidden="true"
          preload="none"
          loop
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setCanLoadVideo(false)}
        />
      ) : null}
      <div className={styles.veil} />
      <span className={styles.credit}>{filmNote}</span>
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
