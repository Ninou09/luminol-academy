import {
  getCommonDictionary,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';

import {
  followCopy,
  officialAddress,
  officialContacts,
  openingHours,
} from '../lib/contact-channels';
import { founderNav, founderPath } from '../lib/founder';
import { privacyPolicy } from '../lib/privacy-policy';
import { SocialIcons } from './social-icons';
import { getPublicCopy } from '../lib/public-localization';
import { getRequestLocale } from '../lib/request-locale';
import { CurrentPageLink } from './current-page-link';
import { LanguageSwitcher } from './language-switcher';
import { getPortalHref, portalLabel } from '../lib/portal-link';
import { MobileMenu } from './mobile-menu';
import { ResourcesMenu } from './resources-menu';
import { NewsletterSignup } from './newsletter-signup';
import { AcademyLogo as Wordmark } from './academy-logo';
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

const menuLabels = {
  ar: { open: 'القائمة', close: 'إغلاق القائمة', home: 'الرئيسية' },
  fr: { open: 'Menu', close: 'Fermer le menu', home: 'Accueil' },
  en: { open: 'Menu', close: 'Close menu', home: 'Home' },
} as const satisfies Record<
  Locale,
  { open: string; close: string; home: string }
>;

const journalLabel = {
  ar: 'المجلة',
  fr: 'Journal',
  en: 'Journal',
} as const satisfies Record<Locale, string>;

const libraryLabel = {
  ar: 'المكتبة النفسية',
  fr: 'Bibliothèque psy',
  en: 'Psychology library',
} as const satisfies Record<Locale, string>;

const eventsLabel = {
  ar: 'اللقاءات والفعاليات',
  fr: 'Rencontres',
  en: 'Events',
} as const satisfies Record<Locale, string>;

const resourcesCopy = {
  ar: {
    label: 'موارد',
    journal: 'مقالات قصيرة للحياة اليومية والتعلّم',
    events: 'لقاءات قادمة وأرشيف الجلسات السابقة',
    library: 'مكتبة بصرية عربية في علم النفس',
  },
  fr: {
    label: 'Ressources',
    journal: 'Des articles courts pour le quotidien et l’apprentissage',
    events: 'Rencontres à venir et archive des sessions passées',
    library: 'Une bibliothèque visuelle de psychologie en arabe',
  },
  en: {
    label: 'Resources',
    journal: 'Short articles for everyday life and learning',
    events: 'Upcoming meetings and the archive of past sessions',
    library: 'An Arabic visual library of psychology',
  },
} as const satisfies Record<
  Locale,
  { label: string; journal: string; events: string; library: string }
>;

const consultationsLabel = {
  ar: 'الاستشارات النفسية',
  fr: 'Consultations',
  en: 'Consultations',
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
          <CurrentPageLink
            className={styles.brand}
            href={localizeHref(locale, '/')}
            activePathname="/"
          >
            <Wordmark />
          </CurrentPageLink>
          <nav className={styles.nav} aria-label={copy.site.nav.primaryAria}>
            <CurrentPageLink
              href={localizeHref(locale, '/')}
              activePathname="/"
            >
              {menuLabels[locale].home}
            </CurrentPageLink>
            <CurrentPageLink
              href={localizeHref(locale, '/schools')}
              activePathname="/schools"
              matchDescendants
            >
              {copy.site.nav.schools}
            </CurrentPageLink>
            <CurrentPageLink
              href={localizeHref(locale, '/programmes')}
              activePathname="/programmes"
              matchDescendants
            >
              {copy.site.nav.programmes}
            </CurrentPageLink>
            <CurrentPageLink
              href={localizeHref(locale, '/consultations')}
              activePathname="/consultations"
            >
              {consultationsLabel[locale]}
            </CurrentPageLink>
            <CurrentPageLink
              href={localizeHref(locale, '/approach')}
              activePathname="/approach"
            >
              {copy.site.nav.approach}
            </CurrentPageLink>
            <ResourcesMenu
              label={copy.site.nav.about}
              openOnHover
              links={[
                {
                  href: localizeHref(locale, '/about'),
                  label: copy.site.nav.about,
                  match: '/about',
                },
                {
                  href: localizeHref(locale, founderPath),
                  label: founderNav[locale].label,
                  description: founderNav[locale].description,
                  match: founderPath,
                },
              ]}
            />
            <ResourcesMenu
              label={resourcesCopy[locale].label}
              links={[
                {
                  href: localizeHref(locale, '/journal'),
                  label: journalLabel[locale],
                  description: resourcesCopy[locale].journal,
                  match: '/journal',
                },
                {
                  href: localizeHref(locale, '/events'),
                  label: eventsLabel[locale],
                  description: resourcesCopy[locale].events,
                  match: '/events',
                },
                {
                  href: '/psy-library',
                  label: libraryLabel[locale],
                  description: resourcesCopy[locale].library,
                  match: '/psy-library',
                },
              ]}
            />
          </nav>
          <div className={`${styles.actions} site-header-actions`}>
            <LanguageSwitcher
              locale={locale}
              label={common.languageSelectorLabel}
            />
            <MobileMenu
              openLabel={menuLabels[locale].open}
              closeLabel={menuLabels[locale].close}
              hours={`${openingHours.title[locale]} · ${openingHours.label[locale]}`}
              contacts={[
                {
                  href: localizeHref(locale, '/contact'),
                  label: copy.site.nav.contact,
                },
                { href: getPortalHref(locale), label: portalLabel[locale] },
                {
                  href: `tel:${officialContacts.phone}`,
                  label: officialContacts.phoneDisplay,
                },
                {
                  href: `https://wa.me/${officialContacts.whatsapp.replace(/\D/g, '')}`,
                  label: 'WhatsApp',
                  external: true,
                },
              ]}
              links={[
                {
                  href: localizeHref(locale, '/'),
                  label: menuLabels[locale].home,
                  match: '/',
                },
                {
                  href: localizeHref(locale, '/schools'),
                  label: copy.site.nav.schools,
                  match: '/schools',
                },
                {
                  href: localizeHref(locale, '/programmes'),
                  label: copy.site.nav.programmes,
                  match: '/programmes',
                },
                {
                  href: localizeHref(locale, '/consultations'),
                  label: consultationsLabel[locale],
                  match: '/consultations',
                },
                {
                  href: localizeHref(locale, '/approach'),
                  label: copy.site.nav.approach,
                  match: '/approach',
                },
                {
                  href: localizeHref(locale, '/about'),
                  label: copy.site.nav.about,
                  match: '/about',
                },
                {
                  href: localizeHref(locale, founderPath),
                  label: founderNav[locale].label,
                  match: founderPath,
                },
                {
                  href: localizeHref(locale, '/journal'),
                  label: journalLabel[locale],
                  match: '/journal',
                },
                {
                  href: localizeHref(locale, '/events'),
                  label: eventsLabel[locale],
                  match: '/events',
                },
                {
                  href: '/psy-library',
                  label: libraryLabel[locale],
                  match: '/psy-library',
                },
              ]}
            />
            <a
              className={styles.accountLink}
              href={getPortalHref(locale)}
              aria-label={portalLabel[locale]}
              title={portalLabel[locale]}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="12" cy="8.5" r="3.6" />
                <path d="M4.8 20c1.2-3.6 4-5.4 7.2-5.4s6 1.8 7.2 5.4" />
              </svg>
              <span className={styles.accountLabel}>{portalLabel[locale]}</span>
            </a>
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
      <NewsletterSignup
        locale={locale}
        privacyHref={localizeHref(locale, '/privacy')}
      />
      <div className={styles.footerMain}>
        <div className={styles.footerBrand}>
          <CurrentPageLink href={localizeHref(locale, '/')} activePathname="/">
            <Wordmark className={styles.footerWordmark ?? ''} />
          </CurrentPageLink>
          <p>{copy.site.description}</p>
          <SocialIcons className={styles.socials} label={followCopy[locale]} />
        </div>
        <nav
          className={styles.footerNav}
          aria-label={footerNavigationLabel[locale]}
        >
          <CurrentPageLink
            href={localizeHref(locale, '/schools')}
            activePathname="/schools"
            matchDescendants
          >
            {copy.site.nav.schools}
          </CurrentPageLink>
          <CurrentPageLink
            href={localizeHref(locale, '/programmes')}
            activePathname="/programmes"
            matchDescendants
          >
            {copy.site.nav.programmes}
          </CurrentPageLink>
          <CurrentPageLink
            href={localizeHref(locale, '/consultations')}
            activePathname="/consultations"
          >
            {consultationsLabel[locale]}
          </CurrentPageLink>
          <CurrentPageLink
            href={localizeHref(locale, '/about')}
            activePathname="/about"
          >
            {copy.site.nav.about}
          </CurrentPageLink>
          <CurrentPageLink
            href={localizeHref(locale, founderPath)}
            activePathname={founderPath}
          >
            {founderNav[locale].label}
          </CurrentPageLink>
          <CurrentPageLink
            href={localizeHref(locale, '/contact')}
            activePathname="/contact"
          >
            {copy.site.nav.contact}
          </CurrentPageLink>
          <Link href={localizeHref(locale, '/journal')}>
            {journalLabel[locale]}
          </Link>
          <Link href="/psy-library">{libraryLabel[locale]}</Link>
          <a href={getPortalHref(locale)}>{portalLabel[locale]}</a>
        </nav>
        <div className={styles.footerHours}>
          <span>{openingHours.title[locale]}</span>
          <p>
            <time>{openingHours.label[locale]}</time>
          </p>
          <small>{openingHours.note[locale]}</small>
          <ul className={styles.footerContacts}>
            <li>
              <a href={`tel:${officialContacts.phone}`} dir="ltr">
                {officialContacts.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={officialAddress.directionsHref}
                target="_blank"
                rel="noopener"
              >
                {officialAddress.street[locale]}, {officialAddress.city[locale]}
              </a>
            </li>
            <li>
              <a href={`mailto:${officialContacts.email}`}>
                {officialContacts.email}
              </a>
            </li>
          </ul>
          <Link
            className={styles.footerCta}
            href={localizeHref(locale, '/contact')}
          >
            {copy.site.nav.contact} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className={styles.megaMark} aria-hidden="true">
        <span>Luminol</span>
      </div>
      <div className={styles.footerBottom}>
        <p>
          © {new Date().getFullYear()} Luminol Academy ·{' '}
          <Link href={localizeHref(locale, '/privacy')}>
            {privacyPolicy[locale].linkLabel}
          </Link>
        </p>
        <p>{copy.site.footerDisciplines}</p>
      </div>
    </footer>
  );
}
