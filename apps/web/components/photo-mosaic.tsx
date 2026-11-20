import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import {
  illustrativePhotoCredit,
  type PeoplePhoto,
} from '../lib/people-photos';
import styles from './photo-mosaic.module.css';

/**
 * A bento gallery of living photos. Tiles rise in sequence, drift at
 * different depths while scrolling and slowly zoom on hover.
 */
export function PhotoMosaic({
  photos,
  locale,
  label,
  className,
}: {
  photos: readonly PeoplePhoto[];
  locale: Locale;
  label: string;
  className?: string | undefined;
}) {
  return (
    <section
      className={[styles.mosaic, className].filter(Boolean).join(' ')}
      aria-label={label}
      data-media-source={illustrativePhotoCredit.source}
    >
      <div className={styles.grid} data-stagger>
        {photos.map((photo, index) => (
          <figure
            key={photo.src}
            className={styles.tile}
            data-no-reveal
            data-depth={index % 2 ? '0.06' : undefined}
          >
            <Image
              src={photo.src}
              alt={photo.alt[locale]}
              fill
              sizes={
                index === 0
                  ? '(max-width: 760px) 100vw, 50vw'
                  : '(max-width: 760px) 50vw, 25vw'
              }
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
