import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorialImage } from '../../components/editorial-image';
import { EnquiryForm } from '../../components/enquiry-form';
import { HomeMotion } from '../../components/home-motion';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { editorialImages } from '../../lib/flagship';
import styles from '../flagship.module.css';

const contactDescription =
  'Tell Luminol about your psychology, language-learning or professional-development goals and find the right next step.';

export const metadata: Metadata = {
  title: 'Contact',
  description: contactDescription,
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Luminol',
    description: contactDescription,
    type: 'website',
    url: '/contact',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Luminol',
    description: contactDescription,
  },
};

const contactPaths = [
  {
    number: '01',
    name: 'Psychology',
    description: 'Wellbeing, family guidance, coaching and workshops.',
    href: '/schools/psychology',
  },
  {
    number: '02',
    name: 'Languages',
    description: 'English, French, fluency and communication pathways.',
    href: '/schools/languages',
  },
  {
    number: '03',
    name: 'Professional Training',
    description: 'Leadership, workplace skills and corporate learning.',
    href: '/schools/training',
  },
] as const;

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <HomeMotion />
      <SiteHeader />

      <section className={styles.internalHero}>
        <div className={styles.internalHeroCopy} data-reveal="left">
          <p className={styles.kicker}>Contact Luminol</p>
          <h1>Your next step starts with a thoughtful conversation.</h1>
          <p>
            Share what you want to understand, learn or strengthen. The team
            will help you find the most relevant school, programme and format.
          </p>
        </div>
        <div className={styles.internalHeroMedia} data-reveal="scale">
          <EditorialImage
            className={styles.internalHeroFigure}
            image={editorialImages.hero}
            priority
            sizes="(max-width: 72rem) 100vw, 52vw"
            caption="A clear first conversation helps shape the right pathway."
          />
          <div className={styles.internalHeroNote}>
            <small>Start clearly</small>
            <p>You do not need to know the exact programme before contacting us.</p>
          </div>
        </div>
      </section>

      <section className={styles.contactPaths}>
        <div className={styles.internalSectionHeading} data-reveal>
          <div>
            <p className={styles.kicker}>Explore before you enquire</p>
            <h2>Choose a direction or ask the team to guide you.</h2>
          </div>
          <p>
            Each branch has a distinct purpose. You can review the options
            first or go directly to the enquiry form.
          </p>
        </div>
        <div className={styles.contactPathGrid}>
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
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.contactContext} data-reveal="left">
          <p className={styles.kicker}>A thoughtful first step</p>
          <h2>What happens after you send the form?</h2>
          <p>
            The enquiry pathway is intentionally simple and does not ask for
            unnecessary sensitive information.
          </p>
          <ol className={styles.contactSteps}>
            <li>
              <span>01</span>
              Your enquiry is securely recorded.
            </li>
            <li>
              <span>02</span>
              The team reviews your goal and area of interest.
            </li>
            <li>
              <span>03</span>
              Luminol follows up with the most suitable next step.
            </li>
          </ol>
          <p>
            Please do not include highly sensitive medical, financial or
            identity information in this form.
          </p>
        </div>
        <div className={styles.formWrap} data-reveal="right">
          <EnquiryForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
