'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { EditorialVideo } from '../lib/flagship';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function ImmersiveHeroMedia({ video }: { video: EditorialVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false);

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
    <div className="v4-hero-media" data-playing={playing ? 'true' : 'false'}>
      <Image
        className="v4-hero-poster"
        src={video.poster.src}
        alt=""
        fill
        priority
        sizes="100vw"
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster={video.poster.src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-hidden="true"
      >
        <source src={video.src} type="video/mp4" />
      </video>
      <div className="v4-hero-media-wash" aria-hidden="true" />
      <div className="v4-hero-media-grid" aria-hidden="true" />
      <button
        className="v4-hero-play"
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? 'إيقاف فيديو الواجهة' : 'تشغيل فيديو الواجهة'}
      >
        <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
        <b>{playing ? 'إيقاف المشهد' : 'تشغيل المشهد'}</b>
      </button>
      <a
        className="v4-hero-credit"
        href={video.creditUrl}
        target="_blank"
        rel="noreferrer"
      >
        فيديو تحريري: {video.credit}
      </a>
    </div>
  );
}
