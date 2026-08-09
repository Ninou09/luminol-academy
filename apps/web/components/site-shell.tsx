import { getCommonDictionary, localizeHref } from '@luminol/localization';
import Link from 'next/link';
import { ButtonLink, Wordmark } from '@luminol/ui';

import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { LanguageSwitcher } from './language-switcher';

export async function SiteHeader() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);
  const common = getCommonDictionary(locale);

  return (
    <header className="site-header">
      <Link
        className="brand-link"
        href={localizeHref(locale, '/')}
        aria-label={copy.site.nav.homeAria}
      >
        <Wordmark />
      </Link>
      <nav className="desktop-nav" aria-label={copy.site.nav.primaryAria}>
        <Link href={localizeHref(locale, '/#schools')}>
          {copy.site.nav.schools}
        </Link>
        <Link href={localizeHref(locale, '/programmes')}>
          {copy.site.nav.programmes}
        </Link>
        <Link href={localizeHref(locale, '/#approach')}>
          {copy.site.nav.approach}
        </Link>
        <Link href={localizeHref(locale, '/about')}>
          {copy.site.nav.about}
        </Link>
      </nav>
      <div className="site-header-actions">
        <LanguageSwitcher
          locale={locale}
          label={common.languageSelectorLabel}
        />
        <ButtonLink href={localizeHref(locale, '/contact')} size="sm">
          {copy.site.nav.contact}
        </ButtonLink>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);

  return (
    <footer>
      <Link
        className="footer-brand"
        href={localizeHref(locale, '/')}
        aria-label={copy.site.nav.homeAria}
      >
        <Wordmark className="footer-wordmark" />
      </Link>
      <p>{copy.site.footerDisciplines}</p>
      <p>© {new Date().getFullYear()} Luminol Academy</p>
    </footer>
  );
}
