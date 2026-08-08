import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';
import { LanguageSwitcher } from './language-switcher';
import { localePath, shellCopy, type PublicLocale } from '../lib/i18n';

function localizedNavigation(locale: PublicLocale) {
  const copy = shellCopy[locale];

  return [
    { href: localePath(locale, '/'), label: copy.home },
    {
      href: localePath(locale, '/schools/psychology'),
      label: copy.psychology,
    },
    {
      href: localePath(locale, '/schools/languages'),
      label: copy.languages,
    },
    {
      href: localePath(locale, '/schools/training'),
      label: copy.training,
    },
    { href: localePath(locale, '/about'), label: copy.about },
  ] as const;
}

function Brand({
  footer = false,
  locale = 'ar',
}: {
  footer?: boolean;
  locale?: PublicLocale;
}) {
  const copy = shellCopy[locale];

  return (
    <span
      className={footer ? 'brand-lockup brand-lockup-footer' : 'brand-lockup'}
    >
      <Image
        className="brand-logo"
        src="/brand/luminol-mark.svg"
        alt=""
        aria-hidden="true"
        width={74}
        height={82}
        priority={!footer}
      />
      <span className="brand-copy">
        <strong>{copy.brand}</strong>
        <small>LUMINOL ACADEMY</small>
      </span>
    </span>
  );
}

export function SiteHeader({
  locale = 'ar',
}: {
  locale?: PublicLocale;
  currentPath?: string;
}) {
  const copy = shellCopy[locale];
  const navigation = localizedNavigation(locale);

  return (
    <>
      <div className="utility-bar">
        <p>{copy.utility}</p>
        <div>
          <span>{copy.location}</span>
          <Link href={localePath(locale, '/contact')}>{copy.contact}</Link>
        </div>
      </div>

      <header className="site-header premium-header">
        <Link
          className="brand-link"
          href={localePath(locale, '/')}
          aria-label={copy.brandAria}
        >
          <Brand locale={locale} />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <LanguageSwitcher locale={locale} />
          <ButtonLink
            className="header-cta"
            href={localePath(locale, '/contact')}
            size="sm"
          >
            {copy.interest}
          </ButtonLink>
        </div>

        <details className="mobile-menu">
          <summary aria-label={copy.menu}>{copy.menu}</summary>
          <nav aria-label="Mobile navigation">
            <LanguageSwitcher locale={locale} />
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label} <span aria-hidden="true">→</span>
              </Link>
            ))}
            <Link href={localePath(locale, '/contact')}>
              {copy.talk} <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </details>
      </header>
    </>
  );
}

export function SiteFooter({ locale = 'ar' }: { locale?: PublicLocale }) {
  const copy = shellCopy[locale];

  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <p>{copy.footerKicker}</p>
        <h2>{copy.footerTitle}</h2>
        <Link href={localePath(locale, '/contact')}>
          {copy.interest} <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="footer-main">
        <div className="footer-intro">
          <Link
            className="footer-brand"
            href={localePath(locale, '/')}
            aria-label={copy.brandAria}
          >
            <Brand footer locale={locale} />
          </Link>
          <p>{copy.footerIntro}</p>
          <span className="footer-location">{copy.location}</span>
        </div>

        <div className="footer-column">
          <h2>{copy.schools}</h2>
          <Link href={localePath(locale, '/schools/psychology')}>
            {copy.psychology}
          </Link>
          <Link href={localePath(locale, '/schools/languages')}>
            {copy.languages}
          </Link>
          <Link href={localePath(locale, '/schools/training')}>
            {copy.training}
          </Link>
        </div>

        <div className="footer-column">
          <h2>{copy.academy}</h2>
          <Link href={localePath(locale, '/about')}>{copy.about}</Link>
          <Link href={localePath(locale, '/contact')}>{copy.talk}</Link>
          <Link href={localePath(locale, '/contact')}>{copy.interest}</Link>
        </div>

        <div className="footer-column">
          <h2>{copy.startHere}</h2>
          <Link href={localePath(locale, '/schools/psychology')}>
            {copy.explorePsychology}
          </Link>
          <Link href={localePath(locale, '/schools/languages')}>
            {copy.exploreLanguages}
          </Link>
          <Link href={localePath(locale, '/schools/training')}>
            {copy.exploreTraining}
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {copy.brand}
        </p>
        <p className="footer-note">{copy.footerNote}</p>
        <div className="footer-bottom-links">
          <Link href="/privacy">{copy.privacy}</Link>
          <Link href="/terms">{copy.terms}</Link>
          <Link href="/cookies">{copy.cookies}</Link>
        </div>
      </div>
    </footer>
  );
}
