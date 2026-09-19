'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import styles from './cinematic-backdrop.module.css';

type CinematicBackdropProps = {
  pauseLabel: string;
  playLabel: string;
};

type DataAwareNavigator = Navigator & {
  connection?: { saveData?: boolean };
};

export function CinematicBackdrop({
  pauseLabel,
  playLabel,
}: CinematicBackdropProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canLoadVideo, setCanLoadVideo] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const saveData = (navigator as DataAwareNavigator).connection?.saveData;

    if (!reducedMotion && !saveData) setCanLoadVideo(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canLoadVideo) return;

    const syncVisibility = () => {
      if (document.hidden) {
        video.pause();
        setPlaying(false);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(video);
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncVisibility);
    };
  }, [canLoadVideo]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <Image
        className={styles.poster}
        src="/media/cinematic/hero-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
      />
      <video
        ref={videoRef}
        className={styles.video}
        src={canLoadVideo ? '/media/cinematic/hero-loop.mp4' : undefined}
        poster="/media/cinematic/hero-poster.webp"
        muted
        aria-hidden="true"
        preload="none"
        loop
        playsInline
        autoPlay={canLoadVideo}
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
