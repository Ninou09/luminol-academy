import type { FaqCopy } from '../lib/faq';
import { serializeJsonLd } from '../lib/structured-data';
import styles from './faq-section.module.css';

/** An accessible accordion of questions, with FAQPage structured data. */
export function FaqSection({
  copy,
  id = 'faq',
  className,
}: {
  copy: FaqCopy;
  id?: string;
  className?: string | undefined;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: copy.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  return (
    <section
      id={id}
      className={[styles.faq, className].filter(Boolean).join(' ')}
      aria-labelledby={`${id}-title`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className={styles.heading} data-reveal>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id={`${id}-title`}>{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>
      <div className={styles.list} data-stagger>
        {copy.items.map((item, index) => (
          <details
            key={item.question}
            className={styles.item}
            name={`${id}-group`}
          >
            <summary>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={styles.question}>{item.question}</span>
              <span className={styles.toggle} aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
