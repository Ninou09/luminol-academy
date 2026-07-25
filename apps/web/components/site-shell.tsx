import { ButtonLink, Wordmark } from '@luminol/ui';

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand-link" href="/" aria-label="Luminol home">
        <Wordmark />
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <a href="/#schools">Our schools</a>
        <a href="/#approach">Our approach</a>
        <a href="/about">About Luminol</a>
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
      <a className="footer-brand" href="/" aria-label="Luminol home">
        <Wordmark className="footer-wordmark" />
      </a>
      <p>Psychology · Languages · Professional Training</p>
      <p>© {new Date().getFullYear()} Luminol Academy</p>
    </footer>
  );
}
