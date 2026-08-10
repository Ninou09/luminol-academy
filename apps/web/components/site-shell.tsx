import { getCommonDictionary, localizeHref } from '@luminol/localization';
import Link from 'next/link';
import { Wordmark } from '@luminol/ui';

import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { LanguageSwitcher } from './language-switcher';
import styles from './site-shell.module.css';

export async function SiteHeader() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);
  const common = getCommonDictionary(locale);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link
          className={styles.brand}
          href={localizeHref(locale, '/')}
          aria-label={copy.site.nav.homeAria}
        >
          <Wordmark />
        </Link>
        <nav className={styles.nav} aria-label={copy.site.nav.primaryAria}>
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
        <div className={`${styles.actions} site-header-actions`}>
          <LanguageSwitcher
            locale={locale}
            label={common.languageSelectorLabel}
          />
          <Link
            className={styles.contactLink}
            href={localizeHref(locale, '/contact')}
            aria-label={copy.site.nav.contact}
          >
            <span className={styles.contactLabel}>{copy.site.nav.contact}</span>{' '}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);
  const footerNavigationLabel = `${copy.site.nav.about} · ${copy.site.nav.programmes}`;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.footerBrand}>
          <Link
            href={localizeHref(locale, '/')}
            aria-label={copy.site.nav.homeAria}
          >
            <Wordmark className={styles.footerWordmark} />
          </Link>
          <p>{copy.site.footerDisciplines}</p>
        </div>
        <div className={styles.footerColumn}>
          <span>{copy.site.nav.primaryAria}</span>
          <nav className={styles.footerNav} aria-label={footerNavigationLabel}>
            <Link href={localizeHref(locale, '/#schools')}>
              {copy.site.nav.schools}
            </Link>
            <Link href={localizeHref(locale, '/programmes')}>
              {copy.site.nav.programmes}
            </Link>
            <Link href={localizeHref(locale, '/about')}>
              {copy.site.nav.about}
            </Link>
            <Link href={localizeHref(locale, '/contact')}>
              {copy.site.nav.contact}
            </Link>
          </nav>
        </div>
        <div className={styles.footerColumn}>
          <span>Luminol Academy</span>
          <p>{copy.site.description}</p>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Luminol Academy</p>
        <p>Luminol · {copy.site.footerDisciplines}</p>
      </div>
    </footer>
  );
}
