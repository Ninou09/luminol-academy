'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { EditorialVideo } from '../lib/flagship';
import type { PublicLocale } from '../lib/i18n';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const ACADEMY_POSTER = '/media/academy/classroom-digital.webp';

const controlCopy = {
  ar: {
    play: 'تشغيل المشهد',
    pause: 'إيقاف المشهد',
    playAria: 'تشغيل فيديو الواجهة',
    pauseAria: 'إيقاف فيديو الواجهة',
    credit: 'فيديو تحريري',
    archive: 'من داخل أكاديمية لومينول',
    archiveNote: 'صورة حقيقية من فضاء الأكاديمية',
  },
  fr: {
    play: 'Lire la scène',
    pause: 'Mettre en pause',
    playAria: 'Lire la vidéo d’introduction',
    pauseAria: 'Mettre en pause la vidéo d’introduction',
    credit: 'Vidéo éditoriale',
    archive: 'Au cœur de Luminol Academy',
    archiveNote: "Photo réelle d'un espace de l'académie",
  },
  en: {
    play: 'Play scene',
    pause: 'Pause scene',
    playAria: 'Play hero video',
    pauseAria: 'Pause hero video',
    credit: 'Editorial video',
    archive: 'Inside Luminol Academy',
    archiveNote: 'Authentic photo from the academy',
  },
} as const;

export function ImmersiveHeroMedia({
  video,
  locale = 'ar',
}: {
  video: EditorialVideo;
  locale?: PublicLocale;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(true);
  const copy = controlCopy[locale];

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    const media = window.matchMedia(REDUCED_MOTION_QUERY);

    const syncPlayback = () => {
      if (document.hidden || media.matches || manualPause) {
        node.pause();
        return;
      }

      void node.play().catch(() => setPlaying(false));
    };

    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    media.addEventListener('change', syncPlayback);

    return () => {
      document.removeEventListener('visibilitychange', syncPlayback);
      media.removeEventListener('change', syncPlayback);
      node.pause();
    };
  }, [manualPause]);

  const togglePlayback = () => {
    const node = videoRef.current;
    if (!node) return;

    if (node.paused) {
      setManualPause(false);
      void node.play().catch(() => setPlaying(false));
      return;
    }

    setManualPause(true);
    node.pause();
  };

  return (
    <div
      className="v4-hero-media v6-hero-media"
      data-playing={playing ? 'true' : 'false'}
    >
      <Image
        className="v4-hero-poster"
        src={ACADEMY_POSTER}
        alt={copy.archiveNote}
        fill
        priority
        sizes="(max-width: 900px) 100vw, 44vw"
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster={ACADEMY_POSTER}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-hidden="true"
      >
        <source src={video.src} type="video/mp4" />
      </video>
      <div className="v4-hero-media-wash" aria-hidden="true" />
      <div className="v4-hero-media-grid" aria-hidden="true" />
      <div className="v11-hero-authenticity" aria-hidden="true">
        <span>01</span>
        <div>
          <strong>{copy.archive}</strong>
          <small>{copy.archiveNote}</small>
        </div>
      </div>
      <button
        className="v4-hero-play"
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? copy.pauseAria : copy.playAria}
      >
        <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
        <b>{playing ? copy.pause : copy.play}</b>
      </button>
      <a
        className="v4-hero-credit"
        href={video.creditUrl}
        target="_blank"
        rel="noreferrer"
      >
        {copy.credit}: {video.credit}
      </a>
    </div>
  );
}
