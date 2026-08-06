'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { editorialGallery, editorialVideos } from '../lib/flagship';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

type VideoEntry = (typeof editorialVideos)[number];

function CinematicVideoCard({
  video,
  index,
}: {
  video: VideoEntry;
  index: number;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (reducedMotion) return;

    if (!('IntersectionObserver' in window)) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) setActive(true);
        if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
        }
      },
      { rootMargin: '18% 0px', threshold: 0.18 },
    );

    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = videoRef.current;
    if (!active || !node || manualPause) return;

    const attempt = node.play();
    if (attempt) void attempt.catch(() => setPlaying(false));
  }, [active, manualPause]);

  const togglePlayback = () => {
    const node = videoRef.current;
    if (!active) {
      setManualPause(false);
      setActive(true);
      return;
    }
    if (!node) return;

    if (node.paused) {
      setManualPause(false);
      void node.play().catch(() => setPlaying(false));
    } else {
      setManualPause(true);
      node.pause();
    }
  };

  return (
    <article className={`cinematic-video-card cinematic-video-card-${index + 1}`} data-reveal>
      <div ref={shellRef} className="cinematic-video-shell">
        <Image
          className="cinematic-video-poster"
          src={video.poster.src}
          alt={video.poster.alt}
          fill
          sizes="(max-width: 900px) 100vw, 58vw"
        />
        {active ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            poster={video.poster.src}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src={video.src} type="video/mp4" />
          </video>
        ) : null}
        <div className="cinematic-video-vignette" aria-hidden="true" />
        <span className="cinematic-video-index" aria-hidden="true">
          0{index + 1}
        </span>
        <button
          type="button"
          className="cinematic-video-control"
          onClick={togglePlayback}
          aria-label={playing ? `إيقاف فيديو ${video.title}` : `تشغيل فيديو ${video.title}`}
        >
          <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
        </button>
      </div>
      <div className="cinematic-video-copy">
        <div>
          <p>{video.eyebrow}</p>
          <h3>{video.title}</h3>
          <span>{video.description}</span>
        </div>
        <a href={video.creditUrl} target="_blank" rel="noreferrer">
          فيديو: {video.credit}
        </a>
      </div>
    </article>
  );
}

export function CinematicMediaWall() {
  return (
    <section className="cinematic-media-section" aria-labelledby="cinematic-media-title">
      <div className="cinematic-media-orbit" aria-hidden="true">
        <span />
        <span />
        <Image src="/brand/luminol-mark.svg" alt="" width={180} height={180} />
      </div>

      <div className="cinematic-media-heading" data-reveal="right">
        <div>
          <p className="ar-kicker">تعلّم يتحرّك</p>
          <h2 id="cinematic-media-title">ليس مجرد موقع. نافذة حيّة على تجربة لومينول.</h2>
        </div>
        <p>
          نستخدم الحركة والصورة لتقريب نوع التفاعل الذي نريد أن يشعر به المتعلم:
          حضور، حوار، ممارسة وتقدّم. اللقطات التالية تحريرية توضيحية وليست صورًا
          من داخل الأكاديمية.
        </p>
      </div>

      <div className="cinematic-video-grid">
        {editorialVideos.map((video, index) => (
          <CinematicVideoCard key={video.id} video={video} index={index} />
        ))}
      </div>

      <div className="cinematic-film-line" aria-hidden="true">
        <span>وعي</span>
        <i>◆</i>
        <span>لغة</span>
        <i>◆</i>
        <span>مهارة</span>
        <i>◆</i>
        <span>تطبيق</span>
        <i>◆</i>
        <span>تقدّم</span>
        <i>◆</i>
        <span>لومينول</span>
      </div>

      <div className="cinematic-gallery" aria-label="مجموعة صور تحريرية توضيحية">
        {editorialGallery.map((image, index) => (
          <figure
            className={`cinematic-still cinematic-still-${index + 1}`}
            data-reveal
            key={image.src}
          >
            <div className="cinematic-still-media">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 760px) 82vw, 34vw"
              />
              <span aria-hidden="true">0{index + 1}</span>
            </div>
            <figcaption>
              <strong>{image.caption}</strong>
              <a href={image.creditUrl} target="_blank" rel="noreferrer">
                {image.credit}
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
