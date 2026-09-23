import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import {
  academyMedia,
  academyStoryMedia,
  type AcademyAssetKey,
  type AcademySchool,
} from '../lib/academy-media';
import styles from './academy-image.module.css';

type AcademyImageProps = {
  school?: AcademySchool;
  asset?: AcademyAssetKey;
  locale: Locale;
  className?: string | undefined;
  priority?: boolean;
  sizes?: string;
};

export function AcademyImage({
  school,
  asset,
  locale,
  className,
  priority = false,
  sizes = '(max-width: 900px) 100vw, 50vw',
}: AcademyImageProps) {
  const media = asset
    ? academyStoryMedia[asset]
    : academyMedia[school ?? 'training'];

  return (
    <figure
      className={`${styles.frame} ${className ?? ''}`}
      data-academy-media={asset ?? school}
      data-media-source={media.sourceUrl}
      data-media-license={media.license ?? 'Unsplash License'}
      data-media-crop={media.crop}
    >
      <Image
        className={styles.image}
        src={media.src}
        alt={media.alt[locale]}
        fill
        priority={priority}
        sizes={sizes}
        style={{ objectPosition: media.position ?? '50% 50%' }}
      />
      <figcaption className={styles.credit}>{media.credit}</figcaption>
    </figure>
  );
}
