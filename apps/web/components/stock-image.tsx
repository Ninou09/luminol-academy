import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import { stockMedia, type StockAsset } from '../lib/stock-media';
import styles from './academy-image.module.css';

const labels: Record<Locale, string> = {
  en: 'Stock photograph · Illustrative scene',
  fr: 'Photo de banque d’images · Scène illustrative',
  ar: 'صورة من مكتبة صور · مشهد توضيحي',
};

export function StockImage({
  asset,
  locale,
  className,
  priority = false,
  sizes = '(max-width: 700px) 100vw, 50vw',
}: {
  asset: StockAsset;
  locale: Locale;
  className?: string | undefined;
  priority?: boolean;
  sizes?: string;
}) {
  const media = stockMedia[asset];
  return (
    <figure
      className={`${styles.frame} ${className ?? ''}`}
      data-stock-media={asset}
      data-media-source={media.sourceUrl}
      data-media-license={media.license}
      data-media-crop={`${media.crop}; cover; focal point ${media.position}`}
      data-media-publication-approved={media.publicationApproved}
    >
      <Image
        className={styles.image}
        src={media.src}
        alt={media.alt[locale]}
        fill
        preload={priority}
        sizes={sizes}
        style={{ objectPosition: media.position }}
      />
      <figcaption className={styles.credit}>{labels[locale]}</figcaption>
    </figure>
  );
}
