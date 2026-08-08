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
const proxySource = readFileSync(resolve('apps/web/proxy.ts'), 'utf8');
const motionSource = readFileSync(
  resolve('apps/web/components/home-motion.tsx'),
  'utf8',
);
const cinematicMediaSource = readFileSync(
  resolve('apps/web/components/cinematic-media.tsx'),
  'utf8',
);
const immersiveHeroSource = readFileSync(
  resolve('apps/web/components/immersive-hero-media.tsx'),
  'utf8',
);
const branchStageSource = readFileSync(
  resolve('apps/web/components/branch-stage.tsx'),
  'utf8',
);
const localizedHomeSource = readFileSync(
  resolve('apps/web/components/localized-home.tsx'),
  'utf8',
);
const localizedAboutSource = readFileSync(
  resolve('apps/web/components/localized-about.tsx'),
  'utf8',
);
const localizedContactSource = readFileSync(
  resolve('apps/web/components/localized-contact.tsx'),
  'utf8',
);
const localizedSchoolSource = readFileSync(
  resolve('apps/web/components/localized-school.tsx'),
  'utf8',
);
const languageSwitcherSource = readFileSync(
  resolve('apps/web/components/language-switcher.tsx'),
  'utf8',
);
const enquiryFormSource = readFileSync(
  resolve('apps/web/components/enquiry-form.tsx'),
  'utf8',
);
const i18nSource = readFileSync(resolve('apps/web/lib/i18n.ts'), 'utf8');
const mediaV6Source = readFileSync(resolve('apps/web/lib/media-v6.ts'), 'utf8');
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
const v4HomeStyles = readFileSync(resolve('apps/web/app/v4-home.css'), 'utf8');
const v4GlobalStyles = readFileSync(
  resolve('apps/web/app/v4-global.css'),
  'utf8',
);
const v4InteractionStyles = readFileSync(
  resolve('apps/web/app/v4-interactions.css'),
  'utf8',
);
const v6Styles = readFileSync(
  resolve('apps/web/app/v6-refinement.css'),
  'utf8',
);
const v8Styles = readFileSync(
  resolve('apps/web/app/v8-institutional-polish.css'),
  'utf8',
);
const v9Styles = readFileSync(
  resolve('apps/web/app/v9-award-refinement.css'),
  'utf8',
);
const v9DetailStyles = readFileSync(
  resolve('apps/web/app/v9-detail-fixes.css'),
  'utf8',
);
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
const sitemapSource = readFileSync(resolve('apps/web/app/sitemap.ts'), 'utf8');

describe('multilingual premium public flagship', () => {
  it('keeps governed school and contact journeys', () => {
    expect(branchStageSource).toContain(
      'localePath(locale, `/schools/${slug}`)',
    );
    expect(pageSource).toContain('href="/contact"');
    expect(schoolSource).toContain('getProgrammesForSchool(slug)');
    expect(contactSource).toContain('<EnquiryForm />');
    expect(enquiryFormSource).toContain('locale,');
  });

  it('publishes Arabic RTL plus French and English LTR experiences', () => {
    expect(layoutSource).toContain('Noto_Sans_Arabic');
    expect(layoutSource).toContain('Manrope');
    expect(layoutSource).toContain("requestHeaders.get('x-luminol-locale')");
    expect(layoutSource).toContain('dir={meta.dir}');
    expect(proxySource).toContain(
      "firstSegment === 'fr' || firstSegment === 'en'",
    );
    expect(i18nSource).toContain("publicLocales = ['ar', 'fr', 'en']");
    expect(localizedHomeSource).toContain('Develop your mind.');
    expect(localizedHomeSource).toContain('Développez votre esprit.');
    expect(localizedAboutSource).toContain('À propos');
    expect(localizedContactSource).toContain('Nous contacter');
    expect(localizedSchoolSource).toContain('Programmes and paths');
    expect(languageSwitcherSource).toContain('usePathname');
    expect(sitemapSource).toContain("['fr', 'en']");
    expect(arabicStyles).toContain('direction: rtl');
  });

  it('uses the official Luminol mark and newly curated education media', () => {
    expect(shellSource).toContain('/brand/luminol-mark.svg');
    expect(pageSource).toContain('premiumVideos.hero');
    expect(pageSource).toContain('<ImmersiveHeroMedia video={heroVideo} />');
    expect(branchStageSource).toContain('<video');
    expect(branchStageSource).toContain('premiumVideos.training');
    expect(branchStageSource).toContain('v9-branch-meta');
    expect(mediaV6Source).toContain('Airam Dato-on / Pexels');
    expect(mediaV6Source).toContain('Vitaly Gariev / Pexels');
    expect(mediaV6Source).toContain('RDNE Stock project / Pexels');
    expect(mediaV6Source).toContain('Matheus Bertelli / Pexels');
    expect(mediaV6Source).toContain('Ivan S / Pexels');
    expect(pageSource).not.toContain('12+');
    expect(pageSource).not.toContain('100%');
    expect(nextConfigSource).toContain("hostname: 'images.pexels.com'");
  });

  it('adds video with tight media security and honest attribution', () => {
    expect(pageSource).toContain('<CinematicMediaWall />');
    expect(mediaV6Source).toContain('videos.pexels.com');
    expect(mediaV6Source).toContain('8419413-hd_1920_1080_30fps.mp4');
    expect(mediaV6Source).toContain('8196801-hd_1920_1080_25fps.mp4');
    expect(mediaV6Source).toContain('8428200-uhd_3840_2160_25fps.mp4');
    expect(mediaV6Source).toContain('8461012-uhd_3840_2160_25fps.mp4');
    expect(immersiveHeroSource).toContain('<source src={video.src}');
    expect(immersiveHeroSource).toContain('<video');
    expect(cinematicMediaSource).toContain('premiumVideos.psychology');
    expect(cinematicMediaSource).toContain('IntersectionObserver');
    expect(cinematicMediaSource).toContain('preload="none"');
    expect(cinematicMediaSource).toContain('setInView(entry.isIntersecting)');
    expect(cinematicMediaSource).toContain('v9-film-copy');
    expect(cinematicMediaSource).toContain('مواد تحريرية توضيحية');
    expect(cinematicMediaSource).toContain('Luminol Academy students');
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

  it('uses cinematic progressive enhancement with stronger CTA motion', () => {
    expect(pageSource).toContain('<HomeMotion />');
    expect(pageSource).toContain('data-reveal');
    expect(pageSource).toContain('v6-conversion-rail');
    expect(pageSource).toContain('v6-floating-cta');
    expect(motionSource).toContain('IntersectionObserver');
    expect(motionSource).toContain('requestAnimationFrame');
    expect(motionSource).toContain('--scroll-velocity');
    expect(motionSource).toContain('--pointer-x');
    expect(motionSource).toContain('.v6-primary-action');
    expect(motionSource).toContain("'(prefers-reduced-motion: reduce)'");
    expect(cinematicStyles).toContain('.motion-cursor');
    expect(cinematicMediaStyles).toContain('v5-ticker-move');
    expect(cinematicMediaStyles).toContain('scroll-snap-type');
    expect(v4HomeStyles).toContain('.v4-branch-stage');
    expect(v4GlobalStyles).toContain('.ar-method-section');
    expect(v4InteractionStyles).toContain('v4-hero-line-in');
    expect(v6Styles).toContain('.language-switcher');
    expect(v6Styles).toContain('.v6-branch-video');
    expect(v6Styles).toContain('.v6-conversion-rail');
    expect(v6Styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(v8Styles).toContain('.v4-quick-access a > div::before');
    expect(v9Styles).toContain('.v9-film-card');
    expect(v9Styles).toContain('.ar-internal-hero');
    expect(v9Styles).toContain('@keyframes v9-grid-drift');
    expect(v9Styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(v9DetailStyles).toContain('@keyframes v9-detail-float');
    expect(v9DetailStyles).toContain('.footer-lead h2');
    expect(layoutSource).toContain("import './v9-award-refinement.css'");
    expect(layoutSource).toContain("import './v9-detail-fixes.css'");
    expect(motionStyles).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('provides responsive navigation and route-preserving language switching', () => {
    expect(shellSource).toContain('<details className="mobile-menu">');
    expect(shellSource).toContain('<LanguageSwitcher locale={locale} />');
    expect(languageSwitcherSource).toContain('pathname.replace(/^\\/(fr|en)');
    expect(i18nSource).toContain("fr: { label: 'Français'");
    expect(i18nSource).toContain("en: { label: 'English'");
  });
});