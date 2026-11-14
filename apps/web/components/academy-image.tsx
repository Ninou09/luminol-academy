import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import {
  academyMedia,
  brandArtworkCredit,
  type AcademySchool,
  type CommissionedScene,
} from '../lib/academy-media';
import { illustrativePhotoCredit } from '../lib/people-photos';
import styles from './academy-image.module.css';

type AcademyImageProps = {
  school: AcademySchool;
  locale: Locale;
  className?: string | undefined;
  priority?: boolean;
  sizes?: string;
  /**
   * A commissioned Luminol scene to show instead of the school's editorial
   * photograph. Provenance and credit switch to the commissioned artwork.
   */
  scene?: CommissionedScene | undefined;
  /** 'photo' marks the scene as commissioned photography (no visible credit). */
  sceneKind?: 'artwork' | 'photo';
};

export function AcademyImage({
  school,
  locale,
  className,
  priority = false,
  sizes = '(max-width: 900px) 100vw, 50vw',
  scene,
  sceneKind = 'artwork',
}: AcademyImageProps) {
  if (scene) {
    const credit =
      sceneKind === 'photo' ? illustrativePhotoCredit : brandArtworkCredit;
    return (
      <figure
        className={`${styles.frame} ${className ?? ''}`}
        data-academy-media={school}
        data-media-source={credit.source}
        data-media-license={credit.license}
        data-media-crop="center-center"
      >
        <Image
          className={styles.image}
          src={scene.src}
          alt={scene.alt[locale]}
          fill
          priority={priority}
          sizes={sizes}
        />
        {sceneKind === 'photo' ? null : (
          <figcaption className={styles.credit}>
            <span>{brandArtworkCredit.label[locale]}</span>
          </figcaption>
        )}
      </figure>
    );
  }

  const media = academyMedia[school];

  return (
    <figure
      className={`${styles.frame} ${className ?? ''}`}
      data-academy-media={school}
      data-media-source={media.sourceUrl}
      data-media-license="Unsplash License"
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
