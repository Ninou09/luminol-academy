import type { SchoolSlug } from '../lib/schools';
import Image from 'next/image';

import { brandArtwork } from '../lib/academy-media';
import styles from './editorial-media.module.css';

export type EditorialMediaAsset = {
  src: string;
  alt: string;
  source: 'sanity';
};

type EditorialMediaProps = {
  school: SchoolSlug;
  asset?: EditorialMediaAsset | null | undefined;
  priority?: boolean | undefined;
  sizes?: string | undefined;
  className?: string | undefined;
};

const schoolClass: Record<SchoolSlug, string> = {
  psychology: styles.psychology ?? '',
  languages: styles.languages ?? '',
  training: styles.training ?? '',
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
          <Image
            className={styles.image}
            src={brandArtwork.orb.src}
            alt=""
            width={brandArtwork.orb.width}
            height={brandArtwork.orb.height}
            sizes={sizes}
            priority={priority}
          />
          <span className={styles.tint} />
        </div>
      )}
    </div>
  );
}
