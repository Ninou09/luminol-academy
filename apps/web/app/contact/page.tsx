import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { EnquiryForm } from '../../components/enquiry-form';
import { HomeMotion } from '../../components/home-motion';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { editorialImages } from '../../lib/flagship';

const contactDescription =
  'تواصل مع أكاديمية لومينول للاستفسار عن علم النفس، اللغات أو التكوين والتطوير المهني وتحديد المسار الأنسب لهدفك.';

export const metadata: Metadata = {
  title: 'تواصل معنا',
  description: contactDescription,
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'تواصل مع أكاديمية لومينول',
    description: contactDescription,
    type: 'website',
    url: '/contact',
    locale: 'ar_DZ',
  },
  twitter: {
    card: 'summary',
    title: 'تواصل مع أكاديمية لومينول',
    description: contactDescription,
  },
};

const contactPaths = [
  {
    number: '01',
    name: 'علم النفس',
    description: 'دعم نفسي وتطوير شخصي، إرشاد عائلي وورشات.',
    href: '/schools/psychology',
  },
  {
    number: '02',
    name: 'اللغات',
    description: 'الإنجليزية، الفرنسية، الطلاقة والتواصل.',
    href: '/schools/languages',
  },
  {
    number: '03',
    name: 'التكوين المهني',
    description: 'القيادة، مهارات العمل وبرامج المؤسسات.',
    href: '/schools/training',
  },
] as const;

export default function ContactPage() {
  return (
    <main className="ar-page">
      <HomeMotion />
      <SiteHeader />

      <section className="ar-internal-hero ar-contact-hero">
        <div className="ar-internal-hero-media" aria-hidden="true">
          <Image
            src={editorialImages.hero.src}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="ar-internal-hero-shade" />
        <div className="ar-internal-hero-content" data-reveal="right">
          <p className="ar-kicker">تواصل معنا</p>
          <h1>خطوتك التالية تبدأ بمحادثة واضحة.</h1>
          <p>
            أخبرنا بما تريد أن تفهمه، تتعلمه أو تطوره. سيساعدك الفريق على تحديد
            القسم، البرنامج والصيغة الأنسب.
          </p>
        </div>
      </section>

      <section className="ar-contact-paths">
        <div className="ar-section-heading" data-reveal>
          <div>
            <p className="ar-kicker">استكشف قبل إرسال الطلب</p>
            <h2>اختر الاتجاه، أو دع الفريق يساعدك في الاختيار.</h2>
          </div>
          <p>
            لكل قسم هدف مختلف. يمكنك الاطلاع على التفاصيل أولًا أو الانتقال
            مباشرة إلى نموذج الاستفسار.
          </p>
        </div>
        <div className="ar-contact-path-grid">
          {contactPaths.map((path, index) => (
            <Link
              data-reveal
              href={path.href}
              key={path.name}
              style={{ '--reveal-delay': `${index * 65}ms` } as CSSProperties}
            >
              <span>{path.number}</span>
              <h2>{path.name}</h2>
              <p>{path.description}</p>
              <b aria-hidden="true">←</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="ar-contact-section">
        <div className="ar-contact-context" data-reveal="right">
          <p className="ar-kicker">بداية بسيطة</p>
          <h2>ماذا يحدث بعد إرسال النموذج؟</h2>
          <p>
            صممنا مسار الاستفسار ليكون واضحًا ولا يطلب معلومات حساسة لا نحتاجها.
          </p>
          <ol className="ar-contact-steps">
            <li>
              <span>01</span>
              يتم تسجيل استفسارك بصورة آمنة.
            </li>
            <li>
              <span>02</span>
              يراجع الفريق هدفك والمجال الذي تهتم به.
            </li>
            <li>
              <span>03</span>
              نتواصل معك بأقرب خطوة مناسبة ومتاحة.
            </li>
          </ol>
          <p>
            من فضلك لا ترسل معلومات طبية أو مالية أو وثائق هوية حساسة عبر هذا
            النموذج.
          </p>
        </div>
        <div className="ar-form-wrap" data-reveal="left">
          <EnquiryForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
