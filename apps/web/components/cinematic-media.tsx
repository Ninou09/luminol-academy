'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import '../app/cinematic-media.css';
import type { EditorialVideo } from '../lib/flagship';
import type { PublicLocale } from '../lib/i18n';
import { premiumGallery, premiumVideos } from '../lib/media-v6';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const mediaCopy = {
  ar: {
    overline: 'الحركة جزء من القصة',
    title: 'شاهد نوع التجربة قبل أن تدخل القاعة.',
    intro:
      'صور هذه المساحة من أرشيف أكاديمية لومينول الحقيقي. الفيديوهات وحدها مواد تحريرية مؤقتة إلى أن تتوفر لقطات لومينول الأصلية المصرّح بنشرها.',
    statementOverline: 'من الفكرة إلى الفعل',
    statementTitle: 'التعلم الجيد لا ينتهي عند آخر شريحة في العرض.',
    statementBody:
      'التجربة تضع الإنسان داخل المشهد: يسأل، يجرّب، يشرح، يستمع ثم يعود إلى حياته أو عمله بشيء يمكن تطبيقه.',
    ticker: 'وعي · لغة · مهارة · تطبيق · تواصل · تقدّم · LUMINOL ·',
    galleryOverline: 'إيقاع بصري أكثر إنسانية',
    galleryTitle: 'صور تضع الأشخاص والتفاعل في قلب التجربة.',
    galleryAria: 'مجموعة صور حقيقية من أرشيف أكاديمية لومينول',
    note: 'الصور المعروضة هنا من أرشيف أكاديمية لومينول. الفيديوهات فقط مواد تحريرية توضيحية مرخّصة من Pexels ولا تمثّل طلاب لومينول.',
    play: 'تشغيل الفيديو',
    pause: 'إيقاف الفيديو',
    credit: 'فيديو تحريري',
  },
  fr: {
    overline: 'Le mouvement raconte aussi',
    title: 'Ressentez le type d’expérience avant même d’entrer en salle.',
    intro:
      'Les photographies de cette section proviennent des archives réelles de Luminol Academy. Seules les vidéos restent des médias éditoriaux temporaires.',
    statementOverline: 'De l’idée à l’action',
    statementTitle: 'Un bon apprentissage ne s’arrête pas à la dernière slide.',
    statementBody:
      'L’expérience place la personne dans l’action: questionner, essayer, expliquer, écouter puis repartir avec quelque chose d’utilisable.',
    ticker:
      'CONSCIENCE · LANGUE · COMPÉTENCE · ACTION · LIEN · PROGRÈS · LUMINOL ·',
    galleryOverline: 'Un rythme visuel plus humain',
    galleryTitle:
      'Des images où les personnes et l’interaction restent au centre.',
    galleryAria: 'Galerie de photographies réelles de Luminol Academy',
    note: 'Les photographies sont issues des archives de Luminol Academy. Seules les vidéos sont des médias éditoriaux illustratifs sous licence Pexels.',
    play: 'Lire la vidéo',
    pause: 'Mettre la vidéo en pause',
    credit: 'Vidéo éditoriale',
  },
  en: {
    overline: 'Motion carries the story',
    title: 'Feel the kind of experience before you enter the room.',
    intro:
      'The photography in this section comes from the real Luminol Academy archive. Only the videos remain temporary editorial media.',
    statementOverline: 'From idea to action',
    statementTitle: 'Good learning does not end on the final slide.',
    statementBody:
      'The experience puts people inside the action: asking, trying, explaining, listening and leaving with something they can actually use.',
    ticker:
      'AWARENESS · LANGUAGE · SKILL · ACTION · CONNECTION · PROGRESS · LUMINOL ·',
    galleryOverline: 'A more human visual rhythm',
    galleryTitle: 'Images that keep people and interaction at the centre.',
    galleryAria: 'Real Luminol Academy photography gallery',
    note: 'The photographs shown here are from the Luminol Academy archive. Only the videos are illustrative editorial media licensed from Pexels.',
    play: 'Play video',
    pause: 'Pause video',
    credit: 'Editorial video',
  },
} as const;

function EditorialFilm({
  video,
  variant,
  locale,
}: {
  video: EditorialVideo;
  variant: 'wide' | 'portrait';
  locale: PublicLocale;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const copy = mediaCopy[locale];

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
    <article className={`v5-film v5-film-${variant} v9-film-card`} data-reveal>
      <div
        ref={shellRef}
        className="v5-film-media v6-film-media v9-film-visual"
      >
        <Image
          className="v5-film-poster"
          src={video.poster.src}
          alt={video.poster.alt}
          fill
          sizes={
            variant === 'wide'
              ? '(max-width: 900px) 100vw, 60vw'
              : '(max-width: 900px) 100vw, 34vw'
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
          aria-label={`${playing ? copy.pause : copy.play}: ${video.title}`}
        >
          <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
        </button>
      </div>

      <div className="v9-film-copy">
        <span>{video.eyebrow}</span>
        <h3>{video.title}</h3>
        <p>{video.description}</p>
        <a href={video.creditUrl} target="_blank" rel="noreferrer">
          {copy.credit}: {video.credit}
        </a>
      </div>
    </article>
  );
}

export function CinematicMediaWall({
  locale = 'ar',
}: {
  locale?: PublicLocale;
}) {
  const copy = mediaCopy[locale];

  return (
    <section
      className="cinematic-media-section v5-media v6-media"
      aria-labelledby="cinematic-media-title"
    >
      <div className="v5-media-mark" aria-hidden="true">
        <Image src="/brand/luminol-mark.svg" alt="" width={320} height={350} />
      </div>

      <header className="v5-media-heading" data-reveal="right">
        <div>
          <p className="v4-overline">{copy.overline}</p>
          <h2 id="cinematic-media-title">{copy.title}</h2>
        </div>
        <p>{copy.intro}</p>
      </header>

      <div className="v5-feature-film">
        <span className="v5-feature-index" aria-hidden="true">
          02 / HUMAN
        </span>
        <EditorialFilm
          video={premiumVideos.psychology}
          variant="wide"
          locale={locale}
        />
      </div>

      <div className="v5-film-split">
        <div className="v5-film-statement" data-reveal="right">
          <span aria-hidden="true">03</span>
          <p className="v4-overline">{copy.statementOverline}</p>
          <h3>{copy.statementTitle}</h3>
          <p>{copy.statementBody}</p>
        </div>
        <EditorialFilm
          video={premiumVideos.training}
          variant="portrait"
          locale={locale}
        />
      </div>

      <div className="v5-ticker" aria-hidden="true">
        <div className="v5-ticker-track">
          <span>{copy.ticker}</span>
          <span>{copy.ticker}</span>
        </div>
      </div>

      <div className="v5-gallery-heading" data-reveal="right">
        <p className="v4-overline">{copy.galleryOverline}</p>
        <h3>{copy.galleryTitle}</h3>
      </div>

      <div className="v5-gallery" aria-label={copy.galleryAria}>
        {premiumGallery.map((image, index) => (
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

      <p className="v5-media-note">{copy.note}</p>
    </section>
  );
}
