import Link from 'next/link';
import { ButtonLink, Wordmark } from '@luminol/ui';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand-link" href="/" aria-label="Luminol home">
        <Wordmark />
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <Link href="/#schools">Our schools</Link>
        <Link href="/programmes">Programmes</Link>
        <Link href="/#approach">Our approach</Link>
        <Link href="/about">About Luminol</Link>
      </nav>
      <ButtonLink href="/contact" size="sm">
        Start your journey
      </ButtonLink>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <Link className="footer-brand" href="/" aria-label="Luminol home">
        <Wordmark className="footer-wordmark" />
      </Link>
      <p>Psychology · Languages · Professional Training</p>
      <p>© {new Date().getFullYear()} Luminol Academy</p>
    </footer>
  );
}
