import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import {
  illustrativePhotoCredit,
  type PeoplePhoto,
} from '../lib/people-photos';
import bandStyles from './psychology-art.module.css';
import styles from './live-photo.module.css';

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

/** A wide cinematic band of a living photo, opening as you scroll. */
export function PhotoBand({
  photo,
  locale,
  reveal = 'zoom',
  className,
  priority = false,
}: {
  photo: PeoplePhoto;
  locale: Locale;
  reveal?: 'zoom' | 'portal' | 'curtain';
  className?: string | undefined;
  priority?: boolean;
}) {
  return (
    <figure
      className={classes(
        bandStyles.band,
        reveal === 'portal' && bandStyles.portal,
        reveal === 'curtain' && bandStyles.curtain,
        styles.band,
        className,
      )}
      data-band-reveal={reveal}
      data-no-reveal
      data-media-source={illustrativePhotoCredit.source}
      data-media-license={illustrativePhotoCredit.license}
      data-media-crop="center-center"
    >
      <div className={bandStyles.bandInner} data-zoom>
        <Image
          className={bandStyles.bandImage}
          src={photo.src}
          alt={photo.alt[locale]}
          width={photo.width}
          height={photo.height}
          sizes="100vw"
          priority={priority}
        />
      </div>
      <span className={bandStyles.bandVeil} aria-hidden="true" />
      <span className={bandStyles.bandSheen} aria-hidden="true" />
    </figure>
  );
}

/** A framed portrait photo with gentle 3D tilt, light glare. */
export function PhotoCard({
  photo,
  locale,
  className,
  sizes = '(max-width: 900px) 100vw, 40vw',
  priority = false,
}: {
  photo: PeoplePhoto;
  locale: Locale;
  className?: string | undefined;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <figure
      className={classes(styles.card, className)}
      data-tilt="6"
      data-media-source={illustrativePhotoCredit.source}
      data-media-license={illustrativePhotoCredit.license}
      data-media-crop="center-center"
    >
      <Image
        className={styles.cardImage}
        src={photo.src}
        alt={photo.alt[locale]}
        fill
        sizes={sizes}
        priority={priority}
      />
      <span className={styles.cardGlare} aria-hidden="true" />
    </figure>
  );
}
