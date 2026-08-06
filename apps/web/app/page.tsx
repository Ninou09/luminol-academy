import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';
import { HomeMotion } from '../components/home-motion';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import {
  credibilityPrinciples,
  editorialImages,
  learningOpportunities,
} from '../lib/flagship';
import {
  getPublicTeamMembers,
  getPublicTestimonials,
} from '../lib/sanity-public';
import { schools } from '../lib/schools';

const schoolList = Object.values(schools);

const quickLinks = [
  {
    label: 'التسجيل والاستفسار',
    description: 'أخبرنا بهدفك وسنساعدك على اختيار المسار المناسب.',
    href: '/contact',
    index: '01',
  },
  {
    label: 'علم النفس',
    description: 'دعم وتطوير نفسي، إرشاد وورشات عملية.',
    href: '/schools/psychology',
    index: '02',
  },
  {
    label: 'اللغات',
    description: 'الإنجليزية، الفرنسية ومسارات التواصل بطلاقة.',
    href: '/schools/languages',
    index: '03',
  },
  {
    label: 'التكوين المهني',
    description: 'قيادة، تواصل، إنتاجية وبرامج للمؤسسات.',
    href: '/schools/training',
    index: '04',
  },
] as const;

const journey = [
  {
    number: '01',
    title: 'ابدأ بهدفك',
    text: 'أخبرنا بما تريد أن تفهمه، تتعلمه أو تطوره.',
  },
  {
    number: '02',
    title: 'اختر المسار الأنسب',
    text: 'نساعدك على تحديد القسم، المستوى والصيغة المناسبة.',
  },
  {
    number: '03',
    title: 'تعلّم بالممارسة',
    text: 'تجربة منظمة، تمارين مفيدة، وتغذية راجعة واضحة.',
  },
  {
    number: '04',
    title: 'طبّق ما تعلّمته',
    text: 'حوّل المعرفة إلى تواصل أفضل، توازن أكبر أو قدرة مهنية أقوى.',
  },
] as const;

const branchImage = {
  psychology: editorialImages.psychology,
  languages: editorialImages.languages,
  training: editorialImages.training,
} as const;

export default async function Page() {
  const [testimonials, teamMembers] = await Promise.all([
    getPublicTestimonials(),
    getPublicTeamMembers(),
  ]);

  return (
    <main className="ar-page">
      <HomeMotion />
      <SiteHeader />

      <section className="ar-home-hero" aria-labelledby="hero-title">
        <div className="ar-home-hero-media" aria-hidden="true">
          <Image
            src={editorialImages.hero.src}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="ar-home-hero-shade" />
        <div className="ar-home-hero-content" data-reveal="right">
          <p className="ar-kicker">أكاديمية لومينول · البليدة</p>
          <h1 id="hero-title">
            طوّر عقلك.
            <span>عزّز صوتك.</span>
            <em>تقدّم نحو مستقبلك.</em>
          </h1>
          <p className="ar-home-hero-lede">
            علم النفس، تعلّم اللغات، والتكوين والتطوير المهني ضمن أكاديمية
            واحدة حديثة، إنسانية، ومبنية على التعلم الذي يمكن استخدامه في
            الحياة الواقعية.
          </p>
          <div className="ar-hero-actions">
            <ButtonLink href="#schools" size="lg">
              اكتشف أقسام الأكاديمية
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              تواصل مع الفريق
            </ButtonLink>
          </div>
        </div>
        <a
          className="ar-photo-credit"
          href={editorialImages.hero.creditUrl}
          target="_blank"
          rel="noreferrer"
        >
          الصورة: {editorialImages.hero.credit}
        </a>
      </section>

      <nav className="ar-quick-access" aria-label="الوصول السريع">
        {quickLinks.map((item, index) => (
          <Link
            href={item.href}
            key={item.href}
            data-reveal
            style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
          >
            <span>{item.index}</span>
            <div>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </div>
            <b aria-hidden="true">←</b>
          </Link>
        ))}
      </nav>

      <section className="ar-intro-section">
        <div className="ar-section-copy" data-reveal="right">
          <p className="ar-kicker">تعليم يربط بين الإنسان والمهارة</p>
          <h2>لأن التطور الحقيقي لا يحدث في مسارات منفصلة.</h2>
          <p className="ar-large-copy">
            فهم النفس يؤثر في التواصل. التواصل يفتح فرصًا جديدة. والمهارات
            المهنية تصبح أقوى عندما يعرف الشخص كيف يفكر، يعبّر ويتصرف بثقة.
          </p>
          <p>
            لهذا تجمع لومينول بين ثلاثة مجالات مختلفة داخل تجربة واحدة واضحة،
            مع الحفاظ على عمق كل تخصص وحدوده المهنية.
          </p>
          <Link className="ar-text-link" href="/about">
            اكتشف فلسفة لومينول <span aria-hidden="true">←</span>
          </Link>
        </div>
        <figure className="ar-feature-image" data-reveal="left">
          <div>
            <Image
              src={editorialImages.learning.src}
              alt={editorialImages.learning.alt}
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
            />
          </div>
          <figcaption>
            <span>تعلّم جاد، واضح، ومبني على المشاركة.</span>
            <a
              href={editorialImages.learning.creditUrl}
              target="_blank"
              rel="noreferrer"
            >
              الصورة: {editorialImages.learning.credit}
            </a>
          </figcaption>
        </figure>
      </section>

      <section id="schools" className="ar-schools-section">
        <div className="ar-section-heading" data-reveal>
          <div>
            <p className="ar-kicker">أقسام أكاديمية لومينول</p>
            <h2>ثلاثة أقسام. هدف واحد: أن يتحول التعلم إلى قدرة.</h2>
          </div>
          <p>
            اختر المجال الأقرب إلى هدفك الحالي، أو تواصل معنا وسيساعدك الفريق
            على تحديد نقطة البداية المناسبة.
          </p>
        </div>

        <div className="ar-school-grid" role="list">
          {schoolList.map((school, index) => {
            const opportunity = learningOpportunities.find(
              (item) => item.school === school.slug,
            );
            if (!opportunity) return null;
            const image = branchImage[school.slug];

            return (
              <article
                className={`ar-school-card ar-school-${school.slug}`}
                data-reveal
                key={school.slug}
                role="listitem"
                style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}
              >
                <Link
                  className="ar-school-image"
                  href={`/schools/${school.slug}`}
                  aria-label={`فتح صفحة قسم ${school.name}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 780px) 100vw, 33vw"
                  />
                </Link>
                <div className="ar-school-card-body">
                  <div className="ar-school-meta">
                    <span>{school.number}</span>
                    <small>{school.eyebrow}</small>
                  </div>
                  <h3>{school.name}</h3>
                  <p>{school.introduction}</p>
                  <ul>
                    {school.visualWords.map((word) => (
                      <li key={word}>{word}</li>
                    ))}
                  </ul>
                  <Link href={`/schools/${school.slug}`}>
                    {opportunity.cta} <span aria-hidden="true">←</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ar-trust-band" aria-label="مبادئ لومينول">
        <div className="ar-trust-band-inner">
          <div className="ar-trust-intro" data-reveal="right">
            <p className="ar-kicker">لماذا لومينول؟</p>
            <h2>تجربة تعليمية مبنية على الوضوح، التطبيق والاحترام.</h2>
          </div>
          <div className="ar-trust-grid">
            {credibilityPrinciples.map((principle, index) => (
              <article
                data-reveal
                key={principle.title}
                style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ar-journey-section">
        <div className="ar-section-heading" data-reveal>
          <div>
            <p className="ar-kicker">من أول سؤال إلى خطوة واضحة</p>
            <h2>رحلة بسيطة، منظمة، ومبنية حول هدفك.</h2>
          </div>
          <p>
            لا تحتاج إلى معرفة اسم البرنامج المناسب قبل التواصل معنا. ابدأ بما
            تريد الوصول إليه، وسنبني من هناك.
          </p>
        </div>
        <ol className="ar-journey-grid">
          {journey.map((step, index) => (
            <li
              data-reveal
              key={step.number}
              style={{ '--reveal-delay': `${index * 55}ms` } as CSSProperties}
            >
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {teamMembers?.length ? (
        <section className="ar-people-section">
          <div className="ar-section-heading" data-reveal>
            <div>
              <p className="ar-kicker">فريق لومينول</p>
              <h2>خبرات معتمدة تظهر فقط بعد الموافقة على النشر.</h2>
            </div>
            <p>
              نعرض هنا الملفات المهنية النشطة والمعتمدة فقط من نظام المحتوى.
            </p>
          </div>
          <div className="ar-people-grid">
            {teamMembers.slice(0, 4).map((member) => (
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
                <small>{member.school ?? 'أكاديمية لومينول'}</small>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {testimonials?.length ? (
        <section className="ar-testimonials-section">
          <div className="ar-section-heading" data-reveal>
            <div>
              <p className="ar-kicker">آراء منشورة بموافقة أصحابها</p>
              <h2>تجارب حقيقية، بلا شهادات مختلقة.</h2>
            </div>
            <p>
              لا تظهر أي شهادة إلا إذا كانت نشطة وتم تأكيد الموافقة على نشرها.
            </p>
          </div>
          <div className="ar-testimonial-grid">
            {testimonials.slice(0, 3).map((testimonial) => (
              <figure data-reveal key={testimonial._id}>
                <blockquote>«{testimonial.quote}»</blockquote>
                <figcaption>
                  <strong>{testimonial.personName}</strong>
                  <span>{testimonial.context ?? testimonial.school}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="ar-final-cta">
        <div data-reveal="right">
          <p className="ar-kicker">ابدأ بخطوة واضحة</p>
          <h2>ما الذي تريد تطويره الآن؟</h2>
          <p>
            أرسل لنا هدفك وسيساعدك فريق لومينول على تحديد القسم، البرنامج ونقطة
            البداية الأنسب.
          </p>
        </div>
        <ButtonLink data-reveal="left" href="/contact" size="lg">
          تواصل مع فريق لومينول <span aria-hidden="true">←</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
