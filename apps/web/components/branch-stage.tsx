'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { editorialImages } from '../lib/flagship';
import { schools, type SchoolSlug } from '../lib/schools';

const branchOrder: readonly SchoolSlug[] = [
  'psychology',
  'languages',
  'training',
];

const branchImage = {
  psychology: editorialImages.psychology,
  languages: editorialImages.languages,
  training: editorialImages.training,
} as const;

const branchCta = {
  psychology: 'اكتشف برامج علم النفس',
  languages: 'اكتشف برامج اللغات',
  training: 'اكتشف برامج التكوين المهني',
} as const;

export function BranchStage() {
  const [active, setActive] = useState<SchoolSlug>('psychology');

  return (
    <section
      id="schools"
      className={`v4-branch-stage v4-branch-stage-${active}`}
      aria-labelledby="v4-schools-title"
    >
      <header className="v4-branch-heading" data-reveal="right">
        <div>
          <p className="v4-overline">ثلاثة عوالم داخل أكاديمية واحدة</p>
          <h2 id="v4-schools-title">اختر المساحة التي تحتاجها الآن.</h2>
        </div>
        <p>
          لكل قسم إيقاعه وطريقته وشخصيته البصرية. ما يجمعها هو نفس المبدأ: معرفة
          جادة تتحول إلى قدرة يمكن استخدامها خارج القاعة.
        </p>
      </header>

      <div className="v4-branch-experience">
        <div className="v4-branch-visual" aria-live="polite">
          {branchOrder.map((slug) => {
            const image = branchImage[slug];
            const school = schools[slug];

            return (
              <div
                className="v4-branch-image"
                data-active={active === slug ? 'true' : 'false'}
                key={slug}
              >
                <Image
                  src={image.src}
                  alt={active === slug ? image.alt : ''}
                  fill
                  sizes="(max-width: 900px) 100vw, 56vw"
                />
                <span className="v4-branch-image-word" aria-hidden="true">
                  {school.visualWords[1]}
                </span>
                <a
                  className="v4-branch-credit"
                  href={image.creditUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {image.credit}
                </a>
              </div>
            );
          })}
          <div className="v4-branch-mark" aria-hidden="true">
            <Image
              src="/brand/luminol-mark.svg"
              alt=""
              width={280}
              height={310}
            />
          </div>
        </div>

        <nav className="v4-branch-list" aria-label="أقسام أكاديمية لومينول">
          {branchOrder.map((slug, index) => {
            const school = schools[slug];
            const isActive = active === slug;

            return (
              <Link
                className="v4-branch-link"
                data-active={isActive ? 'true' : 'false'}
                href={`/schools/${school.slug}`}
                key={slug}
                onMouseEnter={() => setActive(slug)}
                onFocus={() => setActive(slug)}
              >
                <span className="v4-branch-number">0{index + 1}</span>
                <div>
                  <small>{school.eyebrow}</small>
                  <h3>{school.name}</h3>
                  <p>{school.introduction}</p>
                  <strong>
                    {branchCta[slug]} <b aria-hidden="true">←</b>
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
