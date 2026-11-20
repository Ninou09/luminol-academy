import { UserButton } from '@clerk/nextjs';
import { hasPermission } from '@luminol/auth';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import { Wordmark } from '@luminol/ui';
import { CONSULTATION_TIMEZONE } from '@luminol/validation/consultations';
import {
  crmSections,
  crmSectionSlugs,
  type CrmSectionValue,
} from '@luminol/validation/crm-sections';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { getCrmSectionsCopy } from '../lib/crm-sections-localization';
import { getStaffBadges } from '../lib/staff-badges.server';
import {
  getStaffSidebar,
  type StaffDestinationKey,
} from '../lib/staff-navigation';
import { getStaffNavigationCopy } from '../lib/staff-navigation-localization';
import { AdminLanguageSwitcher } from './admin-language-switcher';

type CrmShellProps = {
  locale: Locale;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    roles: Parameters<typeof hasPermission>[0];
  };
  current: StaffDestinationKey | 'search';
  /** Highlights one section link when `current` is `sections`. */
  currentSection?: CrmSectionValue | undefined;
  query?: string | undefined;
  children: ReactNode;
};

/** Shared CRM frame: permission-aware sidebar, scoped search and account. */
export async function CrmShell({
  locale,
  user,
  current,
  currentSection,
  query,
  children,
}: CrmShellProps) {
  const copy = getStaffNavigationCopy(locale);
  const common = getCommonDictionary(locale);
  const sectionNames = getCrmSectionsCopy(locale).section;
  const destinations = getStaffSidebar((permission) =>
    hasPermission(user.roles, permission),
  );
  const badges = await getStaffBadges(user);
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const today = formatLocalizedDate(new Date(), locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: CONSULTATION_TIMEZONE,
  });

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link
          className="admin-brand"
          href={localizeHref(locale, '/')}
          aria-label={copy.crmLabel}
        >
          <Wordmark />
        </Link>
        <p className="admin-label admin-label-compact">{copy.subtitle}</p>
        <div className="admin-sidebar-locale">
          <AdminLanguageSwitcher
            locale={locale}
            label={common.languageSelectorLabel}
          />
        </div>
        <nav aria-label={copy.aria} className="admin-nav">
          <ul>
            {destinations.map(({ key, href }) => {
              const active = key === current;
              const badge = badges[key];
              return (
                <li key={key}>
                  <Link
                    href={localizeHref(locale, href)}
                    className={active ? 'active' : undefined}
                    aria-current={
                      active && key !== 'sections' ? 'page' : undefined
                    }
                  >
                    <span>{copy.destination[key]}</span>
                    {badge ? (
                      <span className="admin-nav-badge">
                        <span aria-hidden="true">
                          {formatLocalizedNumber(badge, locale)}
                        </span>
                        <span className="sr-only">
                          {copy.waiting(formatLocalizedNumber(badge, locale))}
                        </span>
                      </span>
                    ) : null}
                  </Link>
                  {key === 'sections' ? (
                    <ul className="admin-nav-sub">
                      {crmSections.map((section) => {
                        const sectionActive =
                          current === 'sections' && currentSection === section;
                        return (
                          <li key={section}>
                            <Link
                              href={localizeHref(
                                locale,
                                `/crm/sections/${crmSectionSlugs[section]}`,
                              )}
                              className={sectionActive ? 'active' : undefined}
                              aria-current={sectionActive ? 'page' : undefined}
                            >
                              {sectionNames[section]}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="admin-sidebar-note">
          <p>{copy.footer(today)}</p>
          <p>{copy.shellNote}</p>
        </div>
      </aside>

      <section className="admin-dashboard">
        <header className="admin-topbar">
          <form
            className="crm-search"
            role="search"
            method="get"
            action={localizeHref(locale, '/crm/search')}
          >
            <label className="sr-only" htmlFor="crm-search-query">
              {copy.searchLabel}
            </label>
            <input
              id="crm-search-query"
              type="search"
              name="q"
              minLength={2}
              maxLength={80}
              defaultValue={query ?? ''}
              placeholder={copy.searchPlaceholder}
            />
            <button type="submit">{copy.search}</button>
          </form>
          <div className="admin-account">
            <span dir="auto">{name}</span>
            <UserButton />
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </section>
    </main>
  );
}
