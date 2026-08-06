import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ButtonLink } from '@luminol/ui';
import { HomeMotion } from '../../../components/home-motion';
import { SiteFooter, SiteHeader } from '../../../components/site-shell';
import { branchExperience } from '../../../lib/flagship';
import {
  buildSanityProgrammeImageUrl,
  getProgrammesForSchool,
} from '../../../lib/sanity';
import {
  getPublicTeamMembers,
  getPublicTestimonials,
} from '../../../lib/sanity-public';
import { isSchoolSlug, schools } from '../../../lib/schools';

type SchoolPageProps = {
  params: Promise<{ school: string }>;
};

export function generateStaticParams() {
  return Object.keys(schools).map((school) => ({ school }));
}

export async function generateMetadata({
  params,
}: SchoolPageProps): Promise<Metadata> {
  const { school: slug } = await params;
  if (!isSchoolSlug(slug)) return {};

  const school = schools[slug];
  const route = `/schools/${school.slug}`;

  return {
    title: school.name,
    description: school.introduction,
    alternates: {
      canonical: route,
    },
    openGraph: {
      title: `${school.name} | أكاديمية لومينول`,
      description: school.introduction,
      type: 'website',
      url: route,
      locale: 'ar_DZ',
    },
    twitter: {
      card: 'summary',
      title: `${school.name} | أكاديمية لومينول`,
      description: school.introduction,
    },
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { school: slug } = await params;
  if (!isSchoolSlug(slug)) notFound();

  const school = schools[slug];
  const experience = branchExperience[slug];
  const [cmsProgrammes, teamMembers, testimonials] = await Promise.all([
    getProgrammesForSchool(slug),
    getPublicTeamMembers(slug),
    getPublicTestimonials(slug),
  ]);

  const programmes: Array<{
    id: string;
    title: string;
    description: string;
    delivery?: string | null;
    image?: { url: string; alt: string } | null;
  }> = cmsProgrammes?.length
    ? cmsProgrammes.map((programme) => ({
        id: programme._id,
        title: programme.title,
        description: programme.summary,
        delivery: programme.delivery ?? null,
        image: programme.image
          ? {
              url: buildSanityProgrammeImageUrl(programme.image),
              alt: programme.image.alt,
            }
          : null,
      }))
    : school.programs.map((programme) => ({
        id: programme.title,
        title: programme.title,
        description: programme.description,
      }));

  const relatedSchools = Object.values(schools).filter(
    (item) => item.slug !== school.slug,
  );

  return (
    <main className={`ar-page ar-school-page ar-theme-${school.slug}`}>
      <HomeMotion />
      <SiteHeader />

      <section className="ar-school-hero">
        <div className="ar-school-hero-media" aria-hidden="true">
          <Image
            src={experience.image.src}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="ar-school-hero-shade" />
        <div className="ar-school-hero-content" data-reveal="right">
          <Link className="ar-breadcrumb" href="/#schools">
            أقسام لومينول <span aria-hidden="true">/</span> {school.name}
          </Link>
          <p className="ar-kicker">{experience.themeLabel}</p>
          <h1>{school.headline}</h1>
          <p>{experience.positioning}</p>
          <div className="ar-hero-actions">
            <ButtonLink href="#programmes" size="lg">
              اكتشف البرامج
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              سجّل اهتمامك
            </ButtonLink>
          </div>
        </div>
        <div className="ar-school-hero-badge">
          <span>{school.number}</span>
          <strong>{school.name}</strong>
        </div>
      </section>

      <nav className="ar-section-nav" aria-label="التنقل داخل القسم">
        <a href="#programmes">البرامج</a>
        <a href="#outcomes">النتائج المستهدفة</a>
        <a href="#method">طريقة العمل</a>
        <a href="#faq">الأسئلة الشائعة</a>
      </nav>

      <section className="ar-school-promise">
        <span>ما الذي صُمم هذا القسم لتحقيقه؟</span>
        <blockquote>{school.promise}</blockquote>
      </section>

      <section id="programmes" className="ar-programmes-section">
        <div className="ar-section-heading" data-reveal>
          <div>
            <p className="ar-kicker">البرامج والمسارات</p>
            <h2>اختر مسارًا له هدف واضح.</h2>
          </div>
          <p>
            يتم عرض البرامج المعتمدة من نظام المحتوى عند توفرها، وتبقى المسارات
            الأساسية المراجعة متاحة عندما لا يوجد محتوى منشور جديد.
          </p>
        </div>
        <div className="ar-program-grid">
          {programmes.map((programme, index) => (
            <article
              data-reveal
              key={programme.id}
              style={{ '--reveal-delay': `${(index % 2) * 65}ms` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {programme.image ? (
                <div className="ar-program-image">
                  <Image
                    src={programme.image.url}
                    alt={programme.image.alt}
                    fill
                    sizes="(max-width: 700px) 100vw, 50vw"
                  />
                </div>
              ) : null}
              <h3>{programme.title}</h3>
              {programme.delivery ? <small>{programme.delivery}</small> : null}
              <p>{programme.description}</p>
              <Link href="/contact">
                اسأل عن هذا البرنامج <b aria-hidden="true">←</b>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="outcomes" className="ar-school-split">
        <div className="ar-school-split-copy" data-reveal="right">
          <p className="ar-kicker">الفوائد والنتائج المستهدفة</p>
          <h2>التقدّم يجب أن يكون مفهومًا وقابلًا للاستخدام.</h2>
          <p className="ar-story-lead">
            لا نقدّم وعودًا عامة للجميع؛ التجربة تتغير حسب الشخص، المستوى،
            البرنامج والمشاركة.
          </p>
          <p>
            هذه النقاط توضّح ما صُمم القسم لدعمه من دون ادعاء نتائج مضمونة أو
            أرقام غير موثقة.
          </p>
        </div>
        <ol className="ar-outcome-list">
          {experience.outcomes.map((outcome, index) => (
            <li
              data-reveal="left"
              key={outcome}
              style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {outcome}
            </li>
          ))}
        </ol>
      </section>

      <section id="method" className="ar-method-section">
        <div data-reveal="right">
          <p className="ar-kicker">كيف تسير التجربة؟</p>
          <h2>طريقة واضحة، تتكيف مع الشخص والهدف.</h2>
        </div>
        <ol className="ar-method-list">
          {school.approach.map((step, index) => (
            <li
              data-reveal="left"
              key={step.title}
              style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="ar-audience-section">
        <div className="ar-section-heading" data-reveal>
          <div>
            <p className="ar-kicker">مصمم حول الناس</p>
            <h2>لمن يمكن أن يكون هذا القسم مناسبًا؟</h2>
          </div>
          <p>
            تساعد محادثة الاستفسار على التأكد من أن البرنامج، المجموعة والصيغة
            مناسبة للحالة والهدف الحاليين.
          </p>
        </div>
        <div className="ar-audience-grid">
          {school.audiences.map((audience, index) => (
            <article
              data-reveal
              key={audience}
              style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{audience}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="ar-school-split ar-expertise-section">
        <div className="ar-school-split-copy" data-reveal="right">
          <p className="ar-kicker">خبرة تناسب التخصص</p>
          <h2>المصداقية تبدأ من الشخص والطريقة.</h2>
          <p>
            لا ينشر نظام لومينول ملف أي مدرب أو مختص إلا بعد اعتماد الدور،
            السيرة والصورة للنشر.
          </p>
        </div>
        {teamMembers?.length ? (
          <div className="ar-people-grid ar-school-people-grid">
            {teamMembers.map((member) => (
              <article data-reveal key={member._id}>
                {member.portrait ? (
                  <div className="ar-person-image">
                    <Image
                      src={member.portrait.url}
                      alt={member.portrait.alt}
                      fill
                      sizes="(max-width: 700px) 100vw, 25vw"
                    />
                  </div>
                ) : null}
                <small>{member.role}</small>
                <h3>{member.name}</h3>
                {member.bio ? <p>{member.bio}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <ol className="ar-expertise-list">
            {experience.expertise.map((item, index) => (
              <li data-reveal="left" key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item}
              </li>
            ))}
          </ol>
        )}
      </section>

      {testimonials?.length ? (
        <section className="ar-school-evidence">
          <div>
            <p className="ar-kicker">آراء منشورة بموافقة أصحابها</p>
            <h2>دليل حقيقي بدل العبارات التسويقية المصطنعة.</h2>
          </div>
          <div className="ar-testimonial-grid">
            {testimonials.map((testimonial) => (
              <figure data-reveal key={testimonial._id}>
                <blockquote>«{testimonial.quote}»</blockquote>
                <figcaption>
                  <strong>{testimonial.personName}</strong>
                  <span>{testimonial.context ?? school.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section id="faq" className="ar-faq-section">
        <div data-reveal="right">
          <p className="ar-kicker">الأسئلة الشائعة</p>
          <h2>إجابات مهمة قبل الاستفسار.</h2>
        </div>
        <div className="ar-faq-list">
          {experience.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <aside className="ar-safety-note" aria-label="ملاحظة مهمة حول البرنامج">
        <span>مهم</span>
        <p>{school.note}</p>
      </aside>

      <section className="ar-related-section">
        <div className="ar-section-heading" data-reveal>
          <div>
            <p className="ar-kicker">واصل الاستكشاف</p>
            <h2>التطور يتصل بين كل أقسام لومينول.</h2>
          </div>
          <p>اكتشف جانبًا آخر من التطور النفسي، اللغوي أو المهني.</p>
        </div>
        <div className="ar-related-grid">
          {relatedSchools.map((related) => (
            <Link href={`/schools/${related.slug}`} key={related.slug}>
              <span>{related.number}</span>
              <h3>{related.name}</h3>
              <b aria-hidden="true">←</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="ar-final-cta">
        <div data-reveal="right">
          <p className="ar-kicker">خطوتك التالية</p>
          <h2>ابحث عن المسار الذي يناسب هدفك.</h2>
          <p>
            ابدأ بهدفك، وسيساعدك فريق لومينول على تأكيد البرنامج، المستوى
            والصيغة المتاحة والأنسب.
          </p>
        </div>
        <ButtonLink data-reveal="left" href="/contact" size="lg">
          سجّل اهتمامك <span aria-hidden="true">←</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
