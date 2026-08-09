import type { SchoolSlug } from '../lib/schools';
import Image from 'next/image';

import styles from './editorial-media.module.css';

export type EditorialMediaAsset = {
  src: string;
  alt: string;
  source: 'sanity';
};

type EditorialMediaProps = {
  school: SchoolSlug;
  asset?: EditorialMediaAsset | null;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

const schoolClass: Record<SchoolSlug, string> = {
  psychology: styles.psychology,
  languages: styles.languages,
  training: styles.training,
};

const schoolMark: Record<SchoolSlug, string> = {
  psychology: 'P',
  languages: 'L',
  training: 'T',
};

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function EditorialMedia({
  school,
  asset,
  priority = false,
  sizes = '(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw',
  className,
}: EditorialMediaProps) {
  return (
    <div
      className={classes(styles.frame, schoolClass[school], className)}
      data-media-source={asset?.source ?? 'governed-fallback'}
    >
      {asset ? (
        <Image
          className={styles.image}
          src={asset.src}
          alt={asset.alt}
          width={1200}
          height={675}
          sizes={sizes}
          priority={priority}
        />
      ) : (
        <div className={styles.fallback} aria-hidden="true">
          <span className={styles.grid} />
          <span className={styles.halo} />
          <span className={styles.axis} />
          <span className={styles.mark}>{schoolMark[school]}</span>
        </div>
      )}
    </div>
  );
}
