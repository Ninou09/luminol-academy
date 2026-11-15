import type { Locale } from '@luminol/localization';

import Image from 'next/image';

import { actPhotos } from '../lib/people-photos';
import styles from './act-hexaflex.module.css';

const copy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    body: string;
    centre: string;
    processes: readonly { name: string; hint: string }[];
  }
> = {
  en: {
    eyebrow: 'The ACT model',
    title: 'Six processes, one flexible mind.',
    body: 'Acceptance and Commitment Therapy works with six connected processes that together build psychological flexibility. The course explores each of them in practice.',
    centre: 'Psychological flexibility',
    processes: [
      { name: 'Acceptance', hint: 'Making room for difficult feelings' },
      { name: 'Cognitive defusion', hint: 'Seeing thoughts as thoughts' },
      { name: 'Present moment', hint: 'Contact with the here and now' },
      { name: 'Self-as-context', hint: 'The observing self' },
      { name: 'Values', hint: 'What truly matters' },
      { name: 'Committed action', hint: 'Steps guided by values' },
    ],
  },
  fr: {
    eyebrow: 'Le modèle ACT',
    title: 'Six processus, un esprit flexible.',
    body: 'La thérapie d’acceptation et d’engagement s’appuie sur six processus reliés qui, ensemble, développent la flexibilité psychologique. La formation les explore en pratique.',
    centre: 'Flexibilité psychologique',
    processes: [
      { name: 'Acceptation', hint: 'Faire de la place aux émotions difficiles' },
      { name: 'Défusion cognitive', hint: 'Voir les pensées comme des pensées' },
      { name: 'Moment présent', hint: 'Le contact avec l’ici et maintenant' },
      { name: 'Soi comme contexte', hint: 'Le soi observateur' },
      { name: 'Valeurs', hint: 'Ce qui compte vraiment' },
      { name: 'Action engagée', hint: 'Des pas guidés par les valeurs' },
    ],
  },
  ar: {
    eyebrow: 'نموذج ACT',
    title: 'ست عمليات، وعقل مرن واحد.',
    body: 'يعمل العلاج بالتقبل والالتزام على ست عمليات مترابطة تبني معًا المرونة النفسية، ويستكشف التكوين كل واحدة منها بشكل عملي.',
    centre: 'المرونة النفسية',
    processes: [
      { name: 'التقبّل', hint: 'إفساح المجال للمشاعر الصعبة' },
      { name: 'فكّ الاندماج المعرفي', hint: 'رؤية الأفكار كأفكار' },
      { name: 'اللحظة الحاضرة', hint: 'التواصل مع هنا والآن' },
      { name: 'الذات كسياق', hint: 'الذات الملاحِظة' },
      { name: 'القيم', hint: 'ما يهم حقًا' },
      { name: 'الفعل الملتزم', hint: 'خطوات توجهها القيم' },
    ],
  },
};

/** The ACT "hexaflex": six processes around psychological flexibility. */
export function ActHexaflex({ locale }: { locale: Locale }) {
  const text = copy[locale];
  return (
    <section className={styles.section} aria-labelledby="act-hexaflex-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h2 id="act-hexaflex-title" data-no-split>
          {text.title}
        </h2>
        <p>{text.body}</p>
        <figure className={styles.valuesPhoto}>
          <Image
            src={actPhotos.values.src}
            alt={actPhotos.values.alt[locale]}
            width={actPhotos.values.width}
            height={actPhotos.values.height}
            sizes="(max-width: 860px) 100vw, 36vw"
          />
        </figure>
      </div>
      <div className={styles.diagram}>
        <svg className={styles.lines} viewBox="0 0 400 400" aria-hidden="true">
          <polygon points="200,40 339,120 339,280 200,360 61,280 61,120" />
          <g>
            <line x1="200" y1="40" x2="200" y2="360" />
            <line x1="339" y1="120" x2="61" y2="280" />
            <line x1="339" y1="280" x2="61" y2="120" />
          </g>
          <circle cx="200" cy="200" r="150" className={styles.orbit} />
        </svg>
        <div className={styles.centre}>
          <span>{text.centre}</span>
        </div>
        <ol className={styles.nodes}>
          {text.processes.map((process, index) => (
            <li
              key={process.name}
              className={styles.node}
              style={{ '--n': index } as React.CSSProperties}
              tabIndex={0}
            >
              <strong>{process.name}</strong>
              <small>{process.hint}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
