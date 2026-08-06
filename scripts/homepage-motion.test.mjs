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
const layoutSource = readFileSync(resolve('apps/web/app/layout.tsx'), 'utf8');
const motionSource = readFileSync(
  resolve('apps/web/components/home-motion.tsx'),
  'utf8',
);
const cinematicMediaSource = readFileSync(
  resolve('apps/web/components/cinematic-media.tsx'),
  'utf8',
);
const motionStyles = readFileSync(resolve('apps/web/app/motion.css'), 'utf8');
const arabicStyles = readFileSync(resolve('apps/web/app/arabic.css'), 'utf8');
const cinematicStyles = readFileSync(
  resolve('apps/web/app/cinematic-motion.css'),
  'utf8',
);
const cinematicMediaStyles = readFileSync(
  resolve('apps/web/app/cinematic-media.css'),
  'utf8',
);
const flagshipSource = readFileSync(resolve('apps/web/lib/flagship.ts'), 'utf8');
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
const securityHeadersSource = readFileSync(
  resolve('packages/config/security-headers.mjs'),
  'utf8',
);

describe('Arabic premium public flagship', () => {
  it('keeps governed school and contact journeys', () => {
    expect(pageSource).toContain('href={`/schools/${school.slug}`}');
    expect(pageSource).toContain('href="/contact"');
    expect(schoolSource).toContain('getProgrammesForSchool(slug)');
    expect(contactSource).toContain('<EnquiryForm />');
  });

  it('publishes the public experience in Arabic RTL', () => {
    expect(layoutSource).toContain('<html lang="ar" dir="rtl">');
    expect(pageSource).toContain('طوّر عقلك');
    expect(aboutSource).toContain('من نحن');
    expect(contactSource).toContain('تواصل معنا');
    expect(arabicStyles).toContain('direction: rtl');
  });

  it('uses the official Luminol mark and curated human photography', () => {
    expect(shellSource).toContain('/brand/luminol-mark.svg');
    expect(pageSource).toContain('editorialImages.hero.src');
    expect(flagshipSource).toContain('Pexels');
    expect(flagshipSource).toContain('editorialGallery');
    expect(pageSource).not.toContain('12+');
    expect(pageSource).not.toContain('100%');
    expect(nextConfigSource).toContain("hostname: 'images.pexels.com'");
  });

  it('adds lazy editorial video with tight media security and honest attribution', () => {
    expect(pageSource).toContain('<CinematicMediaWall />');
    expect(flagshipSource).toContain('videos.pexels.com');
    expect(cinematicMediaSource).toContain('IntersectionObserver');
    expect(cinematicMediaSource).toContain('preload="none"');
    expect(cinematicMediaSource).toContain('setInView(entry.isIntersecting)');
    expect(cinematicMediaSource).toContain('وليست صورًا');
    expect(cinematicMediaSource).toContain('prefers-reduced-motion: reduce');
    expect(securityHeadersSource).toContain(
      "media-src 'self' https://videos.pexels.com",
    );
  });

  it('publishes only governed team members and consent-confirmed testimonials', () => {
    expect(publicSanitySource).toContain('active == true');
    expect(publicSanitySource).toContain('consentConfirmed == true');
    expect(pageSource).toContain('testimonials?.length');
    expect(pageSource).toContain('teamMembers?.length');
  });

  it('uses cinematic progressive enhancement with reduced-motion behavior', () => {
    expect(pageSource).toContain('<HomeMotion />');
    expect(pageSource).toContain('data-reveal');
    expect(motionSource).toContain('IntersectionObserver');
    expect(motionSource).toContain('requestAnimationFrame');
    expect(motionSource).toContain('--motion-progress');
    expect(motionSource).toContain('.cinematic-video-card');
    expect(motionSource).toContain('.cinematic-still');
    expect(motionSource).toContain("'(prefers-reduced-motion: reduce)'");
    expect(cinematicStyles).toContain('.motion-cursor');
    expect(cinematicStyles).toContain('--motion-tilt-x');
    expect(cinematicMediaStyles).toContain('cinematic-orbit-spin');
    expect(cinematicMediaStyles).toContain('scroll-snap-type');
    expect(motionStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(arabicStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cinematicStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cinematicMediaStyles).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('provides responsive Arabic navigation without requiring JavaScript', () => {
    expect(shellSource).toContain('<details className="mobile-menu">');
    expect(shellSource).toContain('aria-label="التنقل عبر الهاتف"');
    expect(shellSource).toContain('التكوين المهني');
  });
});
