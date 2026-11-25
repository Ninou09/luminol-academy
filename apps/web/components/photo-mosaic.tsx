'use client';

import type { Locale } from '@luminol/localization';
import Image from 'next/image';
import { useRef, useState } from 'react';

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
}: {
  photos: readonly PeoplePhoto[];
  locale: Locale;
  label: string;
  preserveFrame?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const allowMotion = useMotionAllowed();

  function move(offset: number) {
    const next = (active + offset + photos.length) % photos.length;
    track.current?.children[next]?.scrollIntoView({
      block: 'nearest',
      inline: 'start',
      behavior: allowMotion ? 'smooth' : 'instant',
    });
  }

  return (
    <section className={styles.gallery} aria-label={label}>
      <div className={styles.toolbar}>
        <p>{label}</p>
        <div className={styles.controls}>
          <button
            type="button"
            aria-label={arrows[locale][0]}
            onClick={() => move(-1)}
          >
            <span aria-hidden="true">{locale === 'ar' ? '→' : '←'}</span>
          </button>
          <span aria-live="polite">
            {active + 1} / {photos.length}
          </span>
          <button
            type="button"
            aria-label={arrows[locale][1]}
            onClick={() => move(1)}
          >
            <span aria-hidden="true">{locale === 'ar' ? '←' : '→'}</span>
          </button>
        </div>
      </div>
      <div
        className={styles.track}
        ref={track}
        tabIndex={0}
        role="group"
        aria-label={label}
        onScroll={({ currentTarget }) => {
          const index = Math.round(
            Math.abs(currentTarget.scrollLeft) / currentTarget.clientWidth,
          );
          setActive(Math.min(index, photos.length - 1));
        }}
      >
        {photos.map((photo) => (
          <figure
            key={photo.src}
            className={styles.slide}
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
                sizes="(max-width: 760px) 94vw, 58vw"
              />
            </div>
            <figcaption>{photo.alt[locale]}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
