import type { Locale } from '@luminol/localization';
import Image from 'next/image';

import { founderPhotoCredit, founderPhotos } from '../lib/founder-photos';

import { founderCourses, founderWebsite } from '../lib/founder';
import styles from './founder-training.module.css';

export function FounderTraining({ locale }: { locale: Locale }) {
  const copy = founderCourses[locale];

  return (
    <section
      className={styles.section}
      aria-labelledby="founder-training-title"
    >
      <div>
        <h2 id="founder-training-title">{copy.title}</h2>
        <ul className={styles.courses}>
          {copy.courses.map((course) => (
            <li key={course}>{course}</li>
          ))}
        </ul>
        <a href={founderWebsite}>{copy.action}</a>
      </div>
      <figure
        className={styles.teachingPhoto}
        data-media-source={founderPhotoCredit.source}
        data-media-license={founderPhotoCredit.license}
        data-media-crop="speaker-and-learners"
      >
        <Image
          src={founderPhotos.teaching.src}
          alt={founderPhotos.teaching.alt[locale]}
          fill
          sizes="(max-width: 760px) 90vw, 470px"
        />
      </figure>
    </section>
  );
}
