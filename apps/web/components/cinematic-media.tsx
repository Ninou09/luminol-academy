'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import '../app/cinematic-media.css';
import {
  editorialGallery,
  editorialImages,
  editorialVideos,
  type EditorialVideo,
} from '../lib/flagship';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const supportFilm = editorialVideos[1]!;

const trainingFilm: EditorialVideo = {
  id: 'professional-momentum',
  src: 'https://videos.pexels.com/video-files/5762301/5762301-uhd_3840_2160_24fps.mp4',
  eyebrow: 'التطور المهني',
  title: 'التقدّم المهني يبدأ حين تتحول الخبرة إلى حوار واضح.',
  description:
    'مشهد تحريري لحوار مهني يرمز إلى مشاركة الخبرة، التفكير بصوت مسموع وتحويل الأفكار إلى قرارات أكثر وضوحًا.',
  credit: 'RDNE Stock project / Pexels',
  creditUrl: 'https://www.pexels.com/video/man-being-interviewed-5762301/',
  poster: editorialImages.training,
};

function EditorialFilm({
  video,
  variant,
}: {
  video: EditorialVideo;
  variant: 'wide' | 'portrait';
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (reducedMotion) return;

    if (!('IntersectionObserver' in window)) {
      setMounted(true);
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: '22% 0px', threshold: 0.2 },
    );

    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = videoRef.current;
    if (!mounted || !node) return;

    if (!inView || manualPause || document.hidden) {
      node.pause();
      return;
    }

    void node.play().catch(() => setPlaying(false));
  }, [inView, manualPause, mounted]);

  const toggle = () => {
    const node = videoRef.current;
    if (!mounted) {
      setMounted(true);
      setInView(true);
      setManualPause(false);
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
    <article className={`v5-film v5-film-${variant}`} data-reveal>
      <div ref={shellRef} className="v5-film-media">
        <Image
          className="v5-film-poster"
          src={video.poster.src}
          alt={video.poster.alt}
          fill
          sizes={
            variant === 'wide'
              ? '(max-width: 900px) 100vw, 82vw'
              : '(max-width: 900px) 100vw, 38vw'
          }
        />
        {mounted ? (
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
        <div className="v5-film-shade" aria-hidden="true" />
        <button
          type="button"
          className="v5-film-control"
          onClick={toggle}
          aria-label={
            playing
              ? `إيقاف فيديو ${video.title}`
              : `تشغيل فيديو ${video.title}`
          }
        >
          <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
        </button>
        <div className="v5-film-copy">
          <p>{video.eyebrow}</p>
          <h3>{video.title}</h3>
          <span>{video.description}</span>
        </div>
        <a
          className="v5-film-credit"
          href={video.creditUrl}
          target="_blank"
          rel="noreferrer"
        >
          فيديو تحريري: {video.credit}
        </a>
      </div>
    </article>
  );
}

export function CinematicMediaWall() {
  return (
    <section
      className="cinematic-media-section v5-media"
      aria-labelledby="cinematic-media-title"
    >
      <div className="v5-media-mark" aria-hidden="true">
        <Image src="/brand/luminol-mark.svg" alt="" width={320} height={350} />
      </div>

      <header className="v5-media-heading" data-reveal="right">
        <div>
          <p className="v4-overline">الحركة جزء من القصة</p>
          <h2 id="cinematic-media-title">
            الموقع يجب أن يجعلك تشعر بالتجربة قبل أن تدخل القاعة.
          </h2>
        </div>
        <p>
          لذلك لا نستخدم الفيديو كزينة. كل مشهد هنا يشرح فكرة: الإصغاء،
          المشاركة، الحوار أو التطبيق. المواد مؤقتة وتحريرية إلى أن نستبدلها
          بلقطات لومينول الأصلية والمصرّح بنشرها.
        </p>
      </header>

      <div className="v5-feature-film">
        <span className="v5-feature-index" aria-hidden="true">
          02 / HUMAN
        </span>
        <EditorialFilm video={supportFilm} variant="wide" />
      </div>

      <div className="v5-film-split">
        <div className="v5-film-statement" data-reveal="right">
          <span aria-hidden="true">03</span>
          <p className="v4-overline">من الفكرة إلى الفعل</p>
          <h3>التعلم الجيد لا ينتهي عند آخر شريحة في العرض.</h3>
          <p>
            تصميم التجربة يضع الإنسان داخل المشهد: يسأل، يجرّب، يشرح، يستمع ثم
            يعود إلى حياته أو عمله بشيء يمكن تطبيقه. هذا هو الإيقاع الذي نريد أن
            تملكه لومينول بصريًا وتعليميًا.
          </p>
        </div>
        <EditorialFilm video={trainingFilm} variant="portrait" />
      </div>

      <div className="v5-ticker" aria-hidden="true">
        <div className="v5-ticker-track">
          <span>وعي · لغة · مهارة · تطبيق · تواصل · تقدّم · LUMINOL ·</span>
          <span>وعي · لغة · مهارة · تطبيق · تواصل · تقدّم · LUMINOL ·</span>
        </div>
      </div>

      <div className="v5-gallery-heading" data-reveal="right">
        <p className="v4-overline">لقطات من نوع التجربة التي نبنيها</p>
        <h3>أشخاص حقيقيون. تفاعل حقيقي. صور لا تبدو كخلفية جاهزة.</h3>
      </div>

      <div className="v5-gallery" aria-label="مجموعة صور تحريرية توضيحية">
        {editorialGallery.map((image, index) => (
          <figure
            className={`v5-still v5-still-${index + 1}`}
            data-reveal
            key={image.src}
          >
            <div className="v5-still-media">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 760px) 82vw, 30vw"
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

      <p className="v5-media-note">
        جميع الصور والفيديوهات أعلاه مواد تحريرية توضيحية مرخّصة من Pexels،
        وليست توثيقًا لطلاب أو حصص أكاديمية لومينول.
      </p>
    </section>
  );
}
