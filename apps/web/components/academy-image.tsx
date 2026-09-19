import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import { academyMedia, type AcademySchool } from '../lib/academy-media';
import styles from './academy-image.module.css';

type AcademyImageProps = {
  school: AcademySchool;
  locale: Locale;
  className?: string | undefined;
  priority?: boolean;
  sizes?: string;
};

export function AcademyImage({
  school,
  locale,
  className,
  priority = false,
  sizes = '(max-width: 900px) 100vw, 50vw',
}: AcademyImageProps) {
  const media = academyMedia[school];

  return (
    <figure
      className={`${styles.frame} ${className ?? ''}`}
      data-academy-media={school}
      data-media-source={media.sourceUrl}
      data-media-license="Pexels license"
      data-media-crop={media.crop}
    >
      <Image
        className={styles.image}
        src={media.src}
        alt={media.alt[locale]}
        fill
        priority={priority}
        sizes={sizes}
      />
      <figcaption className={styles.credit}>
        <a href={media.sourceUrl} target="_blank" rel="noreferrer">
          {media.credit}
        </a>
      </figcaption>
    </figure>
  );
}
