import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import { EnquiryForm } from '../../components/enquiry-form';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Tell Luminol about your psychology, language-learning or professional-development goals and find the right next step.',
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
    <main>
      <SiteHeader />

      <section className="contact-hero">
        <div>
          <p className="eyebrow">Contact Luminol</p>
          <h1>Your next step starts with a conversation.</h1>
        </div>
        <p>
          Whether you already know what you need or want help choosing, share
          your goal and Luminol will guide you toward the right school and
          program.
        </p>
      </section>

      <section className="contact-paths section-shell">
        <p className="eyebrow">Explore before you enquire</p>
        <div className="contact-path-grid">
          {contactPaths.map((path) => (
            <a href={path.href} key={path.name}>
              <span>{path.number}</span>
              <h2>{path.name}</h2>
              <p>{path.description}</p>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
      </section>

      <section className="enquiry-section section-shell">
        <div className="enquiry-context">
          <p className="eyebrow eyebrow-light">A thoughtful first step</p>
          <h2>What happens next?</h2>
          <ol>
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
          <p className="privacy-note">
            Please do not include highly sensitive medical, financial or
            identity information in this form.
          </p>
        </div>
        <EnquiryForm />
      </section>

      <SiteFooter />
    </main>
  );
}
