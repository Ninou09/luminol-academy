import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import {
  illustrativePhotoCredit,
  type PeoplePhoto,
} from '../lib/people-photos';
import styles from './photo-stack.module.css';

/**
 * Three living photos layered in real 3D depth. The stack tilts toward the
 * pointer and each layer moves at its own depth, so the scene feels alive.
 * The first photo is the hero; the other two are supporting moments.
 */
export function PhotoStack({
  photos,
  locale,
  className,
  priority = false,
}: {
  photos: readonly [PeoplePhoto, PeoplePhoto] | readonly [PeoplePhoto, PeoplePhoto, PeoplePhoto];
  locale: Locale;
  className?: string | undefined;
  priority?: boolean;
}) {
  const [main, back] = photos;
  const front = photos[2];
  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(' ')}
      data-tilt="10"
      data-media-source={illustrativePhotoCredit.source}
    >
      <span className={styles.halo} aria-hidden="true" />
      <figure className={`${styles.layer} ${styles.back}`} data-no-reveal>
        <Image
          src={back.src}
          alt={back.alt[locale]}
          fill
          sizes="(max-width: 900px) 60vw, 26vw"
        />
      </figure>
      <figure className={`${styles.layer} ${styles.main}`} data-no-reveal>
        <Image
          src={main.src}
          alt={main.alt[locale]}
          fill
          priority={priority}
          sizes="(max-width: 900px) 90vw, 38vw"
        />
        <span className={styles.glare} aria-hidden="true" />
      </figure>
      {front ? (
        <figure className={`${styles.layer} ${styles.front}`} data-no-reveal>
          <Image
            src={front.src}
            alt={front.alt[locale]}
            fill
            sizes="(max-width: 900px) 40vw, 16vw"
          />
        </figure>
      ) : null}
      <span className={`${styles.spark} ${styles.sparkOne}`} aria-hidden="true" />
      <span className={`${styles.spark} ${styles.sparkTwo}`} aria-hidden="true" />
    </div>
  );
}
