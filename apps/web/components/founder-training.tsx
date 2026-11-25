import type { Locale } from '@luminol/localization';

import { founderCourses, founderWebsite } from '../lib/founder';
import styles from './founder-training.module.css';

export function FounderTraining({ locale }: { locale: Locale }) {
  const copy = founderCourses[locale];

  return (
    <section
      className={styles.section}
      aria-labelledby="founder-training-title"
    >
      <h2 id="founder-training-title">{copy.title}</h2>
      <ul className={styles.courses}>
        {copy.courses.map((course) => (
          <li key={course}>{course}</li>
        ))}
      </ul>
      <a href={founderWebsite}>{copy.action}</a>
    </section>
  );
}
