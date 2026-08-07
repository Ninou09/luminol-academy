import Image from 'next/image';
import Link from 'next/link';
import { academyMedia } from '../lib/academy-media';
import { localePath, type PublicLocale } from '../lib/i18n';

const archiveCopy = {
  ar: {
    overline: 'لومينول كما هي فعلًا',
    title: 'مساحات حقيقية. تعلّم حقيقي. لحظات من داخل الأكاديمية.',
    body: 'هذه الصور من أرشيف أكاديمية لومينول، ونستخدمها هنا لتكون هوية الموقع مرتبطة بالمكان والتجربة الحقيقية، لا بصور مخزنة فقط.',
    cta: 'تعرّف على الأكاديمية',
    labels: ['التعلّم داخل القاعة', 'ورشات وتكوين', 'فضاء اللغات', 'محطات من مسيرة لومينول'],
  },
  fr: {
    overline: 'Luminol, telle qu’elle est réellement',
    title: 'Des espaces réels. Des apprentissages réels. Des moments de l’académie.',
    body: 'Ces images proviennent des archives de Luminol Academy. Elles relient l’identité du site au lieu, aux ateliers et à l’expérience réelle plutôt qu’à une galerie entièrement générique.',
    cta: 'Découvrir l’académie',
    labels: ['Apprendre en salle', 'Ateliers et formation', 'Espace langues', 'Moments du parcours Luminol'],
  },
  en: {
    overline: 'Luminol as it really is',
    title: 'Real spaces. Real learning. Moments from inside the academy.',
    body: 'These images come from the Luminol Academy archive, connecting the website to the real place, workshops and learning experience rather than relying only on generic stock photography.',
    cta: 'Discover the academy',
    labels: ['Learning in the classroom', 'Workshops and training', 'Language space', 'Moments from the Luminol journey'],
  },
} as const;

const archiveItems = [
  academyMedia.classroom,
  academyMedia.training,
  academyMedia.languages,
  academyMedia.recognition,
] as const;

export function AcademyArchive({ locale = 'ar' }: { locale?: PublicLocale }) {
  const copy = archiveCopy[locale];

  return (
    <section className="v11-academy-archive" aria-labelledby="academy-archive-title">
      <header className="v11-archive-heading" data-reveal="right">
        <div>
          <p className="v4-overline">{copy.overline}</p>
          <h2 id="academy-archive-title">{copy.title}</h2>
        </div>
        <div>
          <p>{copy.body}</p>
          <Link href={localePath(locale, '/about')}>
            {copy.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <div className="v11-archive-grid">
        {archiveItems.map((item, index) => (
          <figure
            className={`v11-archive-card v11-archive-card-${index + 1}`}
            data-reveal
            key={item.src}
          >
            <div className="v11-archive-image">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 32vw"
              />
              <span aria-hidden="true">0{index + 1}</span>
            </div>
            <figcaption>
              <strong>{copy.labels[index]}</strong>
              <small>{item.label}</small>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
