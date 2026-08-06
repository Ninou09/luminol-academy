import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(resolve('apps/web/app/page.tsx'), 'utf8');
const aboutSource = readFileSync(
  resolve('apps/web/app/about/page.tsx'),
  'utf8',
);
const contactSource = readFileSync(
  resolve('apps/web/app/contact/page.tsx'),
  'utf8',
);
const schoolSource = readFileSync(
  resolve('apps/web/app/schools/[school]/page.tsx'),
  'utf8',
);
const motionSource = readFileSync(
  resolve('apps/web/components/home-motion.tsx'),
  'utf8',
);
const motionStyles = readFileSync(resolve('apps/web/app/motion.css'), 'utf8');
const shellSource = readFileSync(
  resolve('apps/web/components/site-shell.tsx'),
  'utf8',
);
const publicSanitySource = readFileSync(
  resolve('apps/web/lib/sanity-public.ts'),
  'utf8',
);
const nextConfigSource = readFileSync(
  resolve('apps/web/next.config.ts'),
  'utf8',
);

describe('premium public flagship', () => {
  it('keeps governed school and contact journeys', () => {
    expect(pageSource).toContain('href={`/schools/${school.slug}`}');
    expect(pageSource).toContain('href="/contact"');
    expect(schoolSource).toContain('getProgrammesForSchool(slug)');
    expect(contactSource).toContain('<EnquiryForm />');
  });

  it('uses purposeful human photography without fake proof claims', () => {
    expect(pageSource).toContain('<EditorialImage');
    expect(pageSource).not.toContain('12+');
    expect(pageSource).not.toContain('100%');
    expect(nextConfigSource).toContain("hostname: 'images.unsplash.com'");
  });

  it('applies one flagship system across public routes', () => {
    expect(aboutSource).toContain("from '../flagship.module.css'");
    expect(contactSource).toContain("from '../flagship.module.css'");
    expect(schoolSource).toContain("from '../../flagship.module.css'");
  });

  it('publishes only governed team members and consent-confirmed testimonials', () => {
    expect(publicSanitySource).toContain('active == true');
    expect(publicSanitySource).toContain('consentConfirmed == true');
    expect(pageSource).toContain('testimonials?.length');
    expect(pageSource).toContain('teamMembers?.length');
  });

  it('uses progressive enhancement and reduced-motion behavior', () => {
    expect(pageSource).toContain('<HomeMotion />');
    expect(pageSource).toContain('data-reveal');
    expect(motionSource).toContain('IntersectionObserver');
    expect(motionSource).toContain("'(prefers-reduced-motion: reduce)'");
    expect(motionStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(motionStyles).toContain("[data-revealed='true']");
  });

  it('provides responsive navigation without requiring JavaScript', () => {
    expect(shellSource).toContain('<details className="mobile-menu">');
    expect(shellSource).toContain('aria-label="Mobile navigation"');
    expect(shellSource).toContain('Professional Training');
  });
});
