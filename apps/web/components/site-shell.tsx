import Link from 'next/link';
import { ButtonLink, Wordmark } from '@luminol/ui';

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/#schools', label: 'Our schools' },
  { href: '/#approach', label: 'Our approach' },
  { href: '/about', label: 'About Luminol' },
] as const;

export function SiteHeader() {
  return (
    <>
      <div className="announcement-bar">
        Psychology · Languages · Professional Training · One human development
        ecosystem
      </div>
      <header className="site-header premium-header">
        <Link className="brand-link" href="/" aria-label="Luminol home">
          <span className="brand-symbol" aria-hidden="true">
            L
          </span>
          <span className="brand-text">
            <Wordmark />
            <small>Human potential, illuminated</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <span className="language-note" aria-label="Available languages">
            EN · AR
          </span>
          <ButtonLink className="header-cta" href="/contact" size="sm">
            Start your journey
          </ButtonLink>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Open navigation menu">Menu</summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label} <span aria-hidden="true">→</span>
              </Link>
            ))}
            <Link href="/contact">
              Start your journey <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </details>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-intro">
          <Link className="footer-brand" href="/" aria-label="Luminol home">
            <span className="brand-symbol" aria-hidden="true">
              L
            </span>
            <Wordmark className="footer-wordmark" />
          </Link>
          <p>
            A connected academy for emotional wellbeing, confident communication
            and practical professional growth.
          </p>
        </div>

        <div className="footer-column">
          <h2>Explore</h2>
          <Link href="/">Home</Link>
          <Link href="/about">About Luminol</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="footer-column">
          <h2>Our schools</h2>
          <Link href="/schools/psychology">Psychology</Link>
          <Link href="/schools/languages">Languages</Link>
          <Link href="/schools/training">Professional Training</Link>
        </div>

        <div className="footer-column">
          <h2>Begin</h2>
          <span>Blida, Algeria</span>
          <Link href="/contact">Ask about a program</Link>
          <Link href="/contact">Start an enquiry</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Luminol Academy</p>
        <div className="footer-bottom-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
