import Link from 'next/link';
import { ButtonLink, Wordmark } from '@luminol/ui';

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/schools/psychology', label: 'Psychology' },
  { href: '/schools/languages', label: 'Languages' },
  { href: '/schools/training', label: 'Professional Training' },
  { href: '/about', label: 'About' },
] as const;

export function SiteHeader() {
  return (
    <>
      <div className="utility-bar">
        <p>Human development, language learning and professional capability</p>
        <div>
          <span>Blida, Algeria</span>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <header className="site-header premium-header">
        <Link className="brand-link" href="/" aria-label="Luminol Academy home">
          <span className="brand-symbol" aria-hidden="true">
            <b>L</b>
            <i />
            <i />
            <i />
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
          <ButtonLink className="header-cta" href="/contact" size="sm">
            Find your path
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
              Speak with the team <span aria-hidden="true">→</span>
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
      <div className="footer-lead">
        <p>Mind · Voice · Future</p>
        <h2>A connected academy for meaningful human development.</h2>
        <Link href="/contact">
          Begin a conversation <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="footer-main">
        <div className="footer-intro">
          <Link
            className="footer-brand"
            href="/"
            aria-label="Luminol Academy home"
          >
            <span className="brand-symbol" aria-hidden="true">
              <b>L</b>
              <i />
              <i />
              <i />
            </span>
            <Wordmark className="footer-wordmark" />
          </Link>
          <p>
            Psychology, languages and professional training in one thoughtful,
            human-centred ecosystem.
          </p>
          <span className="footer-location">Blida, Algeria</span>
        </div>

        <div className="footer-column">
          <h2>Our schools</h2>
          <Link href="/schools/psychology">Psychology</Link>
          <Link href="/schools/languages">Languages</Link>
          <Link href="/schools/training">Professional Training</Link>
        </div>

        <div className="footer-column">
          <h2>Academy</h2>
          <Link href="/about">About Luminol</Link>
          <Link href="/contact">Contact the team</Link>
          <Link href="/contact">Register your interest</Link>
        </div>

        <div className="footer-column">
          <h2>Start here</h2>
          <Link href="/schools/psychology">Explore wellbeing support</Link>
          <Link href="/schools/languages">Find a language pathway</Link>
          <Link href="/schools/training">Build professional skills</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Luminol Academy</p>
        <p className="footer-note">
          Psychology content is educational and supportive, not emergency or
          medical care.
        </p>
        <div className="footer-bottom-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
