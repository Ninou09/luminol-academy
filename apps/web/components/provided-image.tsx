import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import styles from './academy-image.module.css';

const copy: Record<Locale, { alt: string }> = {
  en: {
    alt: 'French-learning still life with a notebook, French dictionary and the Eiffel Tower in the background.',
  },
  fr: {
    alt: 'Nature morte de l’apprentissage du français, avec un carnet, un dictionnaire et la tour Eiffel à l’arrière-plan.',
  },
  ar: {
    alt: 'دفتر وقاموس لتعلّم الفرنسية مع برج إيفل في الخلفية.',
  },
};

export function ProvidedFrenchImage({ locale }: { locale: Locale }) {
  return (
    <figure
      className={styles.frame}
      data-media-source="Owner-provided attachment: Estudiar frances.jpg"
      data-media-crop="center 53%; cover; retain notebook and Eiffel Tower"
      data-media-publication-approved="true"
    >
      <Image
        className={styles.image}
        src="/media/provided/french-learning.jpg"
        alt={copy[locale].alt}
        fill
        sizes="(max-width: 700px) 100vw, 34vw"
        style={{ objectPosition: '50% 53%' }}
      />
    </figure>
  );
}
