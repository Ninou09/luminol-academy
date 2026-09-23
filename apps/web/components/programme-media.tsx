import type { Locale } from '@luminol/localization';

import {
  resolveProgrammeMedia,
  type ProgrammeMediaInput,
} from '../lib/programme-media';
import { AcademyImage } from './academy-image';
import { EditorialMedia } from './editorial-media';
import { StockImage } from './stock-image';
import styles from './programme-media.module.css';

export function ProgrammeMedia({
  programme,
  locale,
  className,
  priority = false,
  sizes = '(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw',
}: {
  programme: ProgrammeMediaInput;
  locale: Locale;
  className?: string | undefined;
  priority?: boolean | undefined;
  sizes?: string | undefined;
}) {
  const media = resolveProgrammeMedia(programme, locale);

  return (
    <div
      className={`${styles.frame} ${className ?? ''}`}
      data-programme-media={media.kind}
      data-programme-media-source={media.sourceUrl}
      data-programme-media-crop={media.crop}
      data-media-publication-approved={
        media.kind === 'sanity' ? 'true' : undefined
      }
    >
      {media.kind === 'sanity' ? (
        <EditorialMedia
          className={styles.media}
          school={programme.school}
          asset={media}
          priority={priority}
          sizes={sizes}
        />
      ) : media.kind === 'stock' ? (
        <StockImage
          className={styles.media}
          asset={media.asset}
          locale={locale}
          priority={priority}
          sizes={sizes}
        />
      ) : (
        <AcademyImage
          className={styles.media}
          asset={media.asset}
          locale={locale}
          priority={priority}
          sizes={sizes}
        />
      )}
    </div>
  );
}
