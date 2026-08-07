'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { localePath, type PublicLocale } from '../lib/i18n';
import { localizedSchools } from '../lib/localized-schools';
import { premiumImages, premiumVideos } from '../lib/media-v6';
import { schools, type SchoolSlug } from '../lib/schools';

const branchOrder: readonly SchoolSlug[] = [
  'psychology',
  'languages',
  'training',
];

const branchImage = {
  psychology: premiumImages.psychology,
  languages: premiumImages.languages,
  training: premiumImages.training,
} as const;

const branchVideo = {
  psychology: premiumVideos.psychology,
  languages: premiumVideos.languages,
  training: premiumVideos.training,
} as const;

const branchGlyph = {
  psychology: '◌',
  languages: 'A',
  training: '↗',
} as const;

const stageCopy = {
  ar: {
    overline: 'ثلاثة عوالم داخل أكاديمية واحدة',
    title: 'اختر المساحة التي تحتاجها الآن.',
    intro:
      'لكل قسم إيقاعه وطريقته وشخصيته البصرية. ما يجمعها هو نفس المبدأ: معرفة جادة تتحول إلى قدرة يمكن استخدامها خارج القاعة.',
    nav: 'أقسام أكاديمية لومينول',
    cta: {
      psychology: 'اكتشف برامج علم النفس',
      languages: 'اكتشف برامج اللغات',
      training: 'اكتشف برامج التكوين المهني',
    },
  },
  fr: {
    overline: 'Trois univers, une seule académie',
    title: 'Choisissez l’espace dont vous avez besoin maintenant.',
    intro:
      'Chaque pôle possède son rythme, sa méthode et sa personnalité visuelle. Tous partagent la même idée: transformer un apprentissage sérieux en capacité utile hors de la salle.',
    nav: 'Pôles de Luminol Academy',
    cta: {
      psychology: 'Découvrir la psychologie',
      languages: 'Découvrir les langues',
      training: 'Découvrir la formation',
    },
  },
  en: {
    overline: 'Three worlds inside one academy',
    title: 'Choose the space you need right now.',
    intro:
      'Each school has its own rhythm, method and visual personality. They share one principle: serious learning should become capability you can use beyond the classroom.',
    nav: 'Luminol Academy schools',
    cta: {
      psychology: 'Explore Psychology',
      languages: 'Explore Languages',
      training: 'Explore Professional Training',
    },
  },
} as const;

export function BranchStage({ locale = 'ar' }: { locale?: PublicLocale }) {
  const [active, setActive] = useState<SchoolSlug>('psychology');
  const [previewing, setPreviewing] = useState(false);
  const copy = stageCopy[locale];
  const activeVideo = branchVideo[active];
  const activeImage = branchImage[active];
  const activeSchool =
    locale === 'ar' ? schools[active] : localizedSchools[locale][active];
  const activeIndex = branchOrder.indexOf(active) + 1;

  const activate = (slug: SchoolSlug) => {
    setActive(slug);
    setPreviewing(false);
  };

  return (
    <section
      id="schools"
      className={`v4-branch-stage v4-branch-stage-${active} v6-branch-stage`}
      aria-labelledby="v4-schools-title"
    >
      <header className="v4-branch-heading" data-reveal="right">
        <div>
          <p className="v4-overline">{copy.overline}</p>
          <h2 id="v4-schools-title">{copy.title}</h2>
        </div>
        <p>{copy.intro}</p>
      </header>

      <div className="v4-branch-experience">
        <div className="v9-branch-media-column">
          <div
            className="v4-branch-visual v6-branch-visual"
            aria-live="polite"
            onMouseEnter={() => setPreviewing(true)}
            onMouseLeave={() => setPreviewing(false)}
          >
            <Image
              className="v6-branch-poster"
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              sizes="(max-width: 900px) 100vw, 52vw"
            />
            {previewing ? (
              <video
                key={activeVideo.id}
                className="v6-branch-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={activeImage.src}
                aria-hidden="true"
              >
                <source src={activeVideo.src} type="video/mp4" />
              </video>
            ) : null}
            <div className="v6-branch-shade" aria-hidden="true" />
            <a
              className="v4-branch-credit"
              href={activeImage.creditUrl}
              target="_blank"
              rel="noreferrer"
            >
              {activeImage.credit}
            </a>
            <div className="v4-branch-mark" aria-hidden="true">
              <Image
                src="/brand/luminol-mark.svg"
                alt=""
                width={280}
                height={310}
              />
            </div>
          </div>

          <div className="v9-branch-meta" aria-hidden="true">
            <span className="v9-branch-meta-icon">{branchGlyph[active]}</span>
            <div>
              <strong>{activeSchool.name}</strong>
              <small>{activeSchool.eyebrow}</small>
            </div>
            <b>0{activeIndex} / 03</b>
          </div>
        </div>

        <nav className="v4-branch-list" aria-label={copy.nav}>
          {branchOrder.map((slug, index) => {
            const school =
              locale === 'ar' ? schools[slug] : localizedSchools[locale][slug];
            const isActive = active === slug;

            return (
              <Link
                className="v4-branch-link"
                data-active={isActive ? 'true' : 'false'}
                href={localePath(locale, `/schools/${slug}`)}
                key={slug}
                onMouseEnter={() => activate(slug)}
                onFocus={() => activate(slug)}
              >
                <span className="v4-branch-number">0{index + 1}</span>
                <div>
                  <small>{school.eyebrow}</small>
                  <h3>{school.name}</h3>
                  <p>{school.introduction}</p>
                  <strong>
                    {copy.cta[slug]} <b aria-hidden="true">→</b>
                  </strong>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
