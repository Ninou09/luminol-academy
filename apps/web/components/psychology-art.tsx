import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import { brandArtworkCredit, psychologyArtwork } from '../lib/academy-media';
import styles from './psychology-art.module.css';

type ArtworkKey = keyof typeof psychologyArtwork;

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

/**
 * Full-bleed cinematic band: the artwork drifts with scroll depth and the
 * camera slowly pushes in (see ScrollExperience: data-depth / data-zoom).
 */
export function ImmersiveBand({
  art,
  locale,
  className,
  priority = false,
}: {
  art: ArtworkKey;
  locale: Locale;
  className?: string | undefined;
  priority?: boolean;
}) {
  const asset = psychologyArtwork[art];
  return (
    <figure
      className={classes(styles.band, className)}
      data-media-source={brandArtworkCredit.source}
      data-media-license={brandArtworkCredit.license}
      data-media-crop="center-center"
    >
      <div className={styles.bandInner} data-zoom>
        <Image
          className={styles.bandImage}
          src={asset.src}
          alt={asset.alt[locale]}
          width={asset.width}
          height={asset.height}
          sizes="100vw"
          priority={priority}
        />
      </div>
      <span className={styles.bandVeil} aria-hidden="true" />
      <span className={styles.bandSheen} aria-hidden="true" />
    </figure>
  );
}

/** Floating 3D art card with pointer tilt, glare and a slow levitation. */
export function FloatingArt({
  art,
  locale,
  className,
  sizes = '(max-width: 800px) 60vw, 26vw',
}: {
  art: ArtworkKey;
  locale: Locale;
  className?: string | undefined;
  sizes?: string;
}) {
  const asset = psychologyArtwork[art];
  return (
    <figure
      className={classes(styles.floating, className)}
      data-tilt="10"
      data-media-source={brandArtworkCredit.source}
      data-media-license={brandArtworkCredit.license}
      data-media-crop="center-center"
    >
      <span className={styles.floatingGlow} aria-hidden="true" />
      <Image
        className={styles.floatingImage}
        src={asset.src}
        alt={asset.alt[locale]}
        width={asset.width}
        height={asset.height}
        sizes={sizes}
      />
      <span className={styles.floatingGlare} aria-hidden="true" />
    </figure>
  );
}
