'use client';

import { brandArtworkCredit } from '../lib/academy-media';
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
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const allowMotion = useMotionAllowed();
  const [visibleDesktop, setVisibleDesktop] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const canLoadVideo = allowMotion && visibleDesktop && !failed;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const desktop = window.matchMedia('(min-width: 761px) and (hover: hover)');
    let visible = false;
    const sync = () => setVisibleDesktop(desktop.matches && visible);
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      sync();
    });
    observer.observe(root);
    desktop.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      desktop.removeEventListener('change', sync);
    };
  }, []);

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
      ref={rootRef}
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
      {canLoadVideo && (
        <video
          ref={videoRef}
          className={styles.video}
          src={src}
          autoPlay={!userPaused.current}
          muted
          aria-hidden="true"
          preload="none"
          loop
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      )}
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
