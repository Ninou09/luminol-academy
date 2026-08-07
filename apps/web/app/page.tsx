import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';
import './v4-home.css';
import { BranchStage } from '../components/branch-stage';
import { CinematicMediaWall } from '../components/cinematic-media';
import { HomeMotion } from '../components/home-motion';
import { ImmersiveHeroMedia } from '../components/immersive-hero-media';
import { SiteFooter, SiteHeader } from '../components/site-shell';
import { credibilityPrinciples } from '../lib/flagship';
import { premiumGallery, premiumVideos } from '../lib/media-v6';
import {
  getPublicTeamMembers,
  getPublicTestimonials,
} from '../lib/sanity-public';

const heroVideo = premiumVideos.hero;
const manifestoPrimary = premiumGallery[0]!;
const manifestoSecondary = premiumGallery[4]!;

const quickLinks = [
  {
    label: 'علم النفس',
    description: 'وعي، دعم وتطوّر شخصي بمسؤولية.',
    href: '/schools/psychology',
    index: '01',
  },
  {
    label: 'اللغات',
    description: 'لغة تُستخدم، لا تُحفظ فقط.',
    href: '/schools/languages',
    index: '02',
  },
  {
    label: 'التكوين المهني',
    description: 'مهارات عملية للأفراد والفرق.',
    href: '/schools/training',
    index: '03',
  },
  {
    label: 'ابدأ من هدفك',
    description: 'سنساعدك على تحديد نقطة البداية المناسبة.',
    href: '/contact',
    index: '04',
  },
] as const;

const journey = [
  {
    number: '01',
    title: 'ابدأ بالسؤال',
    text: 'ما الذي تريد أن تفهمه، تتعلمه أو تطوره الآن؟',
  },
  {
    number: '02',
    title: 'نحدّد المسار',
    text: 'القسم، المستوى والصيغة تُختار حول الهدف لا حول قالب جاهز.',
  },
  {
    number: '03',
    title: 'تعلّم بالمشاركة',
    text: 'حوار، ممارسة، أمثلة وتغذية راجعة تجعل المعرفة قابلة للاستخدام.',
  },
  {
    number: '04',
    title: 'حوّلها إلى قدرة',
    text: 'الخطوة الأخيرة ليست معرفة أكثر؛ بل تصرّف أو تواصل أو قرار أفضل.',
  },
] as const;

export default async function Page() {
  const [testimonials, teamMembers] = await Promise.all([
    getPublicTestimonials(),
    getPublicTeamMembers(),
  ]);

  return (
    <main className="ar-page v4-home">
      <HomeMotion />
      <SiteHeader currentPath="/" />

      <section className="v4-hero" aria-labelledby="hero-title">
        <ImmersiveHeroMedia video={heroVideo} />
        <div className="v4-hero-gradient" aria-hidden="true" />
        <div className="v4-hero-brand-shape" aria-hidden="true">
          <Image
            src="/brand/luminol-mark.svg"
            alt=""
            width={520}
            height={570}
            priority
          />
        </div>

        <div className="v4-hero-content" data-reveal="right">
          <p className="v4-overline">أكاديمية لومينول · البليدة</p>
          <h1 id="hero-title">
            <span>طوّر عقلك.</span>
            <span>عزّز صوتك.</span>
            <em>وابنِ ما يأتي بعد ذلك.</em>
          </h1>
          <p className="v4-hero-lede">
            علم النفس، اللغات والتكوين المهني في تجربة واحدة مصممة لتحوّل
            المعرفة إلى قدرة حقيقية يمكن استخدامها في الحياة، الدراسة والعمل.
          </p>
          <div className="v4-hero-actions">
            <ButtonLink href="/contact" size="lg">
              ابدأ من هدفك
            </ButtonLink>
            <ButtonLink href="#schools" size="lg" variant="secondary">
              استكشف أقسام الأكاديمية
            </ButtonLink>
          </div>
          <div className="v6-hero-proof">
            <span>ثلاثة أقسام مترابطة</span>
            <span>تعلم إنساني وتطبيقي</span>
            <span>العربية · Français · English</span>
          </div>
        </div>

        <div className="v4-hero-side" aria-hidden="true">
          <span>PSYCHOLOGY</span>
          <i />
          <span>LANGUAGES</span>
          <i />
          <span>PROFESSIONAL</span>
        </div>

        <a className="v4-scroll-cue" href="#v4-start">
          <span>اكتشف التجربة</span>
          <b aria-hidden="true">↓</b>
        </a>
      </section>

      <nav className="v4-quick-access" aria-label="الوصول السريع">
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
            <b aria-hidden="true">↙</b>
          </Link>
        ))}
      </nav>

      <section id="v4-start" className="v4-manifesto">
        <div className="v4-manifesto-number" aria-hidden="true">
          01
        </div>
        <div className="v4-manifesto-copy" data-reveal="right">
          <p className="v4-overline">الفكرة التي تجمع كل شيء</p>
          <h2>لا نبني ثلاث مدارس منفصلة. نبني إنسانًا أكثر قدرة.</h2>
          <p className="v4-manifesto-lead">
            عندما تفهم نفسك بوضوح، تتواصل بصورة أفضل. وعندما تملك لغة وصوتًا
            أقوى، تصبح المهارات المهنية أكثر تأثيرًا. لهذا صُممت لومينول كمنظومة
            مترابطة، لا كمجموعة دورات متجاورة.
          </p>
          <Link className="v4-arrow-link" href="/about">
            تعرّف على فلسفة لومينول <span aria-hidden="true">←</span>
          </Link>
        </div>

        <div className="v4-manifesto-collage" data-reveal="left">
          <figure className="v4-collage-main">
            <Image
              src={manifestoPrimary.src}
              alt={manifestoPrimary.alt}
              fill
              sizes="(max-width: 900px) 88vw, 48vw"
            />
            <figcaption>{manifestoPrimary.caption}</figcaption>
          </figure>
          <figure className="v4-collage-float">
            <Image
              src={manifestoSecondary.src}
              alt={manifestoSecondary.alt}
              fill
              sizes="(max-width: 900px) 44vw, 18vw"
            />
            <figcaption>{manifestoSecondary.caption}</figcaption>
          </figure>
          <div className="v4-collage-word" aria-hidden="true">
            LUMINOL
          </div>
        </div>
      </section>

      <BranchStage />

      <section className="v6-conversion-rail" data-reveal>
        <div>
          <p className="v4-overline">غير متأكد من أين تبدأ؟</p>
          <h2>أخبرنا بما تريد تقويته. سنساعدك على تحديد نقطة البداية.</h2>
          <p>
            لا تحتاج إلى معرفة اسم الدورة أو المستوى. ابدأ بالهدف الذي يهمك
            الآن.
          </p>
        </div>
        <Link className="v6-primary-action" href="/contact">
          صف لنا هدفك ←
        </Link>
      </section>

      <CinematicMediaWall />

      <section className="v4-principles" aria-labelledby="v4-principles-title">
        <header data-reveal="right">
          <p className="v4-overline">ما الذي يجب أن تشعر به التجربة؟</p>
          <h2 id="v4-principles-title">
            واضحة في الفكرة. إنسانية في الأسلوب. قوية في التطبيق.
          </h2>
        </header>
        <div className="v4-principle-grid">
          {credibilityPrinciples.map((principle, index) => (
            <article
              data-reveal
              key={principle.title}
              style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
            >
              <span>0{index + 1}</span>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="v4-journey" aria-labelledby="v4-journey-title">
        <div className="v4-journey-heading" data-reveal="right">
          <p className="v4-overline">رحلة بدون تعقيد</p>
          <h2 id="v4-journey-title">من سؤال صغير إلى خطوة واضحة.</h2>
          <p>
            لا تحتاج إلى معرفة اسم البرنامج المناسب قبل أن تبدأ. يكفي أن تعرف ما
            الذي تريد تغييره أو تطويره.
          </p>
        </div>
        <ol className="v4-journey-track">
          {journey.map((step, index) => (
            <li
              data-reveal="left"
              key={step.number}
              style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties}
            >
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {teamMembers?.length ? (
        <section className="v4-governed-section v4-team-section">
          <header data-reveal="right">
            <p className="v4-overline">الناس خلف التجربة</p>
            <h2>فريق يظهر بالاسم والصورة فقط بعد اعتماد النشر.</h2>
          </header>
          <div className="v4-team-grid">
            {teamMembers.slice(0, 4).map((member, index) => (
              <article
                data-reveal
                key={member._id}
                style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
              >
                {member.portrait ? (
                  <div className="v4-team-image">
                    <Image
                      src={member.portrait.url}
                      alt={member.portrait.alt}
                      fill
                      sizes="(max-width: 760px) 88vw, 25vw"
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
        <section className="v4-governed-section v4-testimonial-section">
          <header data-reveal="right">
            <p className="v4-overline">أصوات حقيقية</p>
            <h2>لا نملأ الفراغ بشهادات مصطنعة.</h2>
          </header>
          <div className="v4-testimonial-grid">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <figure
                data-reveal
                key={testimonial._id}
                style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
              >
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

      <section className="v4-final-cta">
        <div className="v4-final-mark" aria-hidden="true">
          <Image
            src="/brand/luminol-mark.svg"
            alt=""
            width={420}
            height={460}
          />
        </div>
        <div data-reveal="right">
          <p className="v4-overline">خطوتك التالية يمكن أن تبدأ الآن</p>
          <h2>ما الشيء الذي تريد أن يصبح أقوى في حياتك؟</h2>
          <p>
            أخبرنا بهدفك. سنساعدك على تحديد القسم، المستوى والصيغة الأقرب لما
            تحتاجه فعلًا.
          </p>
        </div>
        <ButtonLink data-reveal="left" href="/contact" size="lg">
          ابدأ استفسارك <span aria-hidden="true">←</span>
        </ButtonLink>
      </section>

      <div className="v6-floating-cta">
        <span>تحتاج مساعدة في اختيار المسار؟</span>
        <Link href="/contact">اسأل فريق لومينول ←</Link>
      </div>
      <SiteFooter />
    </main>
  );
}
