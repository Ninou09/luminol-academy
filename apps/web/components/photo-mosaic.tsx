'use client';

import type { Locale } from '@luminol/localization';
import Image from 'next/image';
import { useId, useRef, useState } from 'react';

import { FounderGold } from './founder-gold';
import { GoldAccent } from './gold-accent';

import {
  illustrativePhotoCredit,
  type PeoplePhoto,
} from '../lib/people-photos';
import { useMotionAllowed } from '../lib/calm-mode';
import styles from './photo-mosaic.module.css';

const arrows = {
  en: ['Previous photo', 'Next photo'],
  fr: ['Photo précédente', 'Photo suivante'],
  ar: ['الصورة السابقة', 'الصورة التالية'],
} as const;

export function PhotoMosaic({
  photos,
  locale,
  label,
  preserveFrame,
  chapters,
}: {
  photos: readonly PeoplePhoto[];
  locale: Locale;
  label: string;
  preserveFrame?: string;
  chapters: readonly string[];
}) {
  const trackId = useId();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const allowMotion = useMotionAllowed();

  function select(index: number) {
    const element = track.current;
    if (!element) return;
    element.scrollTo({
      left: index * element.clientWidth * (locale === 'ar' ? -1 : 1),
      behavior:
        allowMotion && Math.abs(index - active) === 1 ? 'smooth' : 'instant',
    });
  }

  function move(offset: number) {
    select((active + offset + photos.length) % photos.length);
  }

  return (
    <section className={styles.gallery} aria-label={label}>
      <div className={styles.toolbar}>
        <h2>{label}</h2>
        <div className={styles.status}>
          <div className={styles.archiveMark}>
            <FounderGold ornate />
            <GoldAccent name="archive" />
          </div>
          <span aria-live="polite" dir="ltr">
            {active + 1} / {photos.length}
          </span>
        </div>
      </div>
      <div className={styles.stage} data-tilt="3">
        {([-1, 1] as const).map((offset, index) => (
          <button
            key={offset}
            type="button"
            className={styles.arrow}
            data-side={offset < 0 ? 'start' : 'end'}
            aria-label={arrows[locale][index]}
            aria-controls={trackId}
            onClick={() => move(offset)}
          >
            <span aria-hidden="true">❯</span>
          </button>
        ))}
        <div
          className={styles.track}
          id={trackId}
          ref={track}
          tabIndex={0}
          data-lenis-prevent-horizontal
          role="group"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              const offset = event.key === 'ArrowRight' ? 1 : -1;
              move(locale === 'ar' ? -offset : offset);
            }
          }}
          onScroll={({ currentTarget }) => {
            const index = Math.round(
              Math.abs(currentTarget.scrollLeft) / currentTarget.clientWidth,
            );
            setActive(Math.min(index, photos.length - 1));
          }}
        >
          {photos.map((photo, index) => (
            <figure
              key={photo.src}
              className={styles.slide}
              data-no-reveal
              data-current={active === index || undefined}
              data-media-source={illustrativePhotoCredit.source}
              data-media-license={illustrativePhotoCredit.license}
            >
              <div
                className={styles.frame}
                data-preserve-frame={photo.src === preserveFrame || undefined}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt[locale]}
                  fill
                  sizes="(max-width: 760px) 94vw, 75vw"
                />
              </div>
              <figcaption>
                <strong>{chapters[index]}</strong>
                <span>{photo.alt[locale]}</span>
                <small className="scene-caption">
                  {illustrativePhotoCredit.label[locale]}
                </small>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className={styles.thumbnails} data-lenis-prevent-horizontal>
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            aria-current={active === index || undefined}
            aria-label={chapters[index] ?? photo.alt[locale]}
            onClick={() => select(index)}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(max-width: 760px) 17vw, 11vw"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
