import {
  getCommonDictionary,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { CurrentPageLink } from './current-page-link';
import { LanguageSwitcher } from './language-switcher';
import styles from './site-shell.module.css';

const skipToContentLabel = {
  ar: 'انتقل إلى المحتوى الرئيسي',
  fr: 'Aller au contenu principal',
  en: 'Skip to main content',
} as const satisfies Record<Locale, string>;

const footerNavigationLabel = {
  ar: 'التنقل في تذييل الصفحة',
  fr: 'Navigation du pied de page',
  en: 'Footer navigation',
} as const satisfies Record<Locale, string>;

export async function SiteHeader() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);
  const common = getCommonDictionary(locale);

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {skipToContentLabel[locale]}
      </a>
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
            <CurrentPageLink
              href={localizeHref(locale, '/programmes')}
              activePathname="/programmes"
              matchDescendants
            >
              {copy.site.nav.programmes}
            </CurrentPageLink>
            <Link href={localizeHref(locale, '/#approach')}>
              {copy.site.nav.approach}
            </Link>
            <CurrentPageLink
              href={localizeHref(locale, '/about')}
              activePathname="/about"
            >
              {copy.site.nav.about}
            </CurrentPageLink>
          </nav>
          <div className={`${styles.actions} site-header-actions`}>
            <LanguageSwitcher
              locale={locale}
              label={common.languageSelectorLabel}
            />
            <CurrentPageLink
              className={styles.contactLink}
              href={localizeHref(locale, '/contact')}
              activePathname="/contact"
              ariaLabel={copy.site.nav.contact}
            >
              <span className={styles.contactLabel}>
                {copy.site.nav.contact}
              </span>{' '}
              <span aria-hidden="true">↗</span>
            </CurrentPageLink>
          </div>
        </div>
      </header>
    </>
  );
}

export async function SiteFooter() {
  const locale = await getRequestLocale();
  const copy = getPublicCopy(locale);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.footerBrand}>
          <Link
            href={localizeHref(locale, '/')}
            aria-label={copy.site.nav.homeAria}
          >
            <Wordmark className={styles.footerWordmark ?? ''} />
          </Link>
          <p>{copy.site.footerDisciplines}</p>
        </div>
        <div className={styles.footerColumn}>
          <span>{copy.site.nav.primaryAria}</span>
          <nav
            className={styles.footerNav}
            aria-label={footerNavigationLabel[locale]}
          >
            <Link href={localizeHref(locale, '/#schools')}>
              {copy.site.nav.schools}
            </Link>
            <CurrentPageLink
              href={localizeHref(locale, '/programmes')}
              activePathname="/programmes"
              matchDescendants
            >
              {copy.site.nav.programmes}
            </CurrentPageLink>
            <CurrentPageLink
              href={localizeHref(locale, '/about')}
              activePathname="/about"
            >
              {copy.site.nav.about}
            </CurrentPageLink>
            <CurrentPageLink
              href={localizeHref(locale, '/contact')}
              activePathname="/contact"
            >
              {copy.site.nav.contact}
            </CurrentPageLink>
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
