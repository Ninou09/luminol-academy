import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { ButtonLink } from '@luminol/ui';
import { HomeMotion } from '../../components/home-motion';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { academyMedia } from '../../lib/academy-media';
import { credibilityPrinciples } from '../../lib/flagship';
import { premiumImages } from '../../lib/media-v6';
import { getPublicTeamMembers } from '../../lib/sanity-public';

const aboutDescription =
  'تعرّف على رؤية أكاديمية لومينول ورسالتها في ربط علم النفس، اللغات والتطوير المهني ضمن تجربة تعليمية إنسانية وعملية.';

export const metadata: Metadata = {
  title: 'من نحن',
  description: aboutDescription,
  alternates: {
    canonical: '/about',
    languages: { ar: '/about', fr: '/fr/about', en: '/en/about' },
  },
  openGraph: {
    title: 'من نحن | أكاديمية لومينول',
    description: aboutDescription,
    type: 'website',
    url: '/about',
    locale: 'ar_DZ',
    alternateLocale: ['fr_DZ', 'en_DZ'],
  },
  twitter: {
    card: 'summary',
    title: 'من نحن | أكاديمية لومينول',
    description: aboutDescription,
  },
};

const values = [
  {
    number: '01',
    title: 'معرفة بعمق ووضوح',
    description:
      'نحوّل المعرفة الجادة إلى لغة مفهومة تحترم عقل المتعلم وتساعده على استخدامها.',
  },
  {
    number: '02',
    title: 'تجربة إنسانية',
    description:
      'الجودة لا تعني أن تصبح التجربة باردة؛ نريدها منظمة، محترمة، وقريبة من الإنسان.',
  },
  {
    number: '03',
    title: 'تقدّم له معنى',
    description:
      'نصمم التعلم حول قرار، مهارة، تواصل أو تغيير يمكن أن ينعكس في الحياة اليومية.',
  },
  {
    number: '04',
    title: 'نمو مترابط',
    description:
      'نربط بين الأبعاد التي تؤثر في طريقة تفكير الإنسان، تواصله، وتقدّمه المهني.',
  },
] as const;

export default async function AboutPage() {
  const teamMembers = await getPublicTeamMembers();

  return (
    <main className="ar-page">
      <HomeMotion />
      <SiteHeader currentPath="/about" />

      <section className="ar-internal-hero ar-about-hero">
        <div className="ar-internal-hero-media" aria-hidden="true">
          <Image
            src={premiumImages.learning.src}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="ar-internal-hero-shade" />
        <div className="ar-internal-hero-content" data-reveal="right">
          <p className="ar-kicker">من نحن</p>
          <h1>نؤمن أن الإنسان لا يتطور في جانب واحد فقط.</h1>
          <p>
            لومينول أكاديمية تجمع بين علم النفس، تعلّم اللغات، والتكوين المهني
            ضمن رؤية واحدة: معرفة واضحة تتحول إلى قدرة يمكن استخدامها.
          </p>
        </div>
      </section>

      <section className="ar-purpose-strip" aria-label="مبادئ الأكاديمية">
        {credibilityPrinciples.slice(0, 3).map((principle, index) => (
          <article
            data-reveal
            key={principle.title}
            style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h2>{principle.title}</h2>
            <p>{principle.text}</p>
          </article>
        ))}
      </section>

      <section className="ar-story-section">
        <div className="ar-story-heading" data-reveal="right">
          <p className="ar-kicker">لماذا توجد لومينول؟</p>
          <h2>لأن المعرفة تصبح أقوى عندما تتصل بما يحتاجه الإنسان فعلًا.</h2>
        </div>
        <div className="ar-story-copy" data-reveal="left">
          <p className="ar-story-lead">
            القوة النفسية، التواصل، والقدرة المهنية تُدرّس غالبًا كمواضيع
            منفصلة، رغم أنها تؤثر في بعضها كل يوم.
          </p>
          <p>
            تجمع لومينول هذه الاحتياجات داخل أكاديمية واحدة من دون إلغاء هوية أي
            تخصص. لكل قسم لغته، حدوده، وطرق عمله، لكن التجربة العامة تبقى واضحة
            ومترابطة للمتعلم.
          </p>
          <p>
            الهدف ليس ملء الوقت بالمحتوى، بل مساعدة الأشخاص والعائلات والمهنيين
            والمؤسسات على إيجاد نقطة بداية مفيدة ثم الاستمرار في التطور مع تغير
            احتياجاتهم.
          </p>
        </div>
      </section>

      <section
        className="ar-split-feature founder-feature"
        aria-labelledby="founder-title"
      >
        <figure
          className="ar-feature-image founder-portrait"
          data-reveal="right"
        >
          <div>
            <Image
              src={academyMedia.founder.src}
              alt={academyMedia.founder.alt}
              fill
              sizes="(max-width: 900px) 82vw, 34vw"
              style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
          </div>
          <figcaption>
            <span>{academyMedia.founder.label}</span>
            <span>صورة رسمية مقدمة من أكاديمية لومينول</span>
          </figcaption>
        </figure>
        <div className="ar-section-copy" data-reveal="left">
          <p className="ar-kicker">المؤسسة</p>
          <h2 id="founder-title">خداوي فطومة</h2>
          <p className="ar-large-copy">
            تقود رؤية لومينول كأكاديمية تربط بين علم النفس، اللغات والتطوير
            المهني ضمن تجربة تعليمية إنسانية وعملية.
          </p>
          <p>
            حضور المؤسسة داخل هوية الأكاديمية يوضح المسؤولية والرؤية التي تقف
            خلف بناء البرامج، اختيار الخبرات، والحفاظ على تجربة تحترم المتعلم
            واحتياجاته.
          </p>
        </div>
      </section>

      <section className="ar-split-feature">
        <figure className="ar-feature-image" data-reveal="right">
          <div>
            <Image
              src={premiumImages.hero.src}
              alt={premiumImages.hero.alt}
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
            />
          </div>
          <figcaption>
            <span>الحوار والمشاركة جزء أساسي من تجربة لومينول.</span>
            <a
              href={premiumImages.hero.creditUrl}
              target="_blank"
              rel="noreferrer"
            >
              الصورة: {premiumImages.hero.credit}
            </a>
          </figcaption>
        </figure>
        <div className="ar-section-copy" data-reveal="left">
          <p className="ar-kicker">الرسالة والرؤية</p>
          <h2>تعلّم واضح. تجربة إنسانية. قدرة تدوم بعد نهاية البرنامج.</h2>
          <p className="ar-large-copy">
            نجعل التطور الشخصي واللغوي والمهني أكثر وضوحًا، أكثر قربًا، وأكثر
            ارتباطًا بالحياة الواقعية.
          </p>
          <p>
            رؤيتنا طويلة المدى هي بناء منظومة موثوقة يستطيع فيها الشخص أن يطوّر
            وعيه النفسي، تواصله، وقدرته المهنية عبر مراحل مختلفة من حياته.
          </p>
          <ButtonLink href="/contact" size="lg">
            تواصل مع فريق لومينول
          </ButtonLink>
        </div>
      </section>

      <section className="ar-values-section">
        <div className="ar-section-heading" data-reveal>
          <div>
            <p className="ar-kicker">ما الذي يوجّهنا؟</p>
            <h2>معايير عالية من دون أن نفقد البعد الإنساني.</h2>
          </div>
          <p>
            هذه المبادئ تؤثر في تصميم البرامج، المحتوى، التواصل، وطريقة استقبال
            كل شخص يتعامل مع الأكاديمية.
          </p>
        </div>
        <div className="ar-values-grid">
          {values.map((value, index) => (
            <article
              data-reveal
              key={value.number}
              style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties}
            >
              <span>{value.number}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      {teamMembers?.length ? (
        <section className="ar-people-section">
          <div className="ar-section-heading" data-reveal>
            <div>
              <p className="ar-kicker">فريق الأكاديمية</p>
              <h2>خبرات معتمدة، معروضة بوضوح.</h2>
            </div>
            <p>
              لا يظهر أي ملف مهني هنا إلا بعد اعتماد الاسم، الدور، السيرة
              والصورة للنشر.
            </p>
          </div>
          <div className="ar-people-grid">
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
                <small>{member.school ?? 'أكاديمية لومينول'}</small>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="ar-final-cta">
        <div data-reveal="right">
          <p className="ar-kicker">مكانك في لومينول</p>
          <h2>أي جانب تريد أن تطوره الآن؟</h2>
          <p>
            استكشف الأقسام الثلاثة أو أخبر الفريق بما تريد فهمه، تعلمه أو
            تطويره.
          </p>
        </div>
        <ButtonLink data-reveal="left" href="/contact" size="lg">
          ابدأ محادثة <span aria-hidden="true">←</span>
        </ButtonLink>
      </section>

      <SiteFooter />
    </main>
  );
}
