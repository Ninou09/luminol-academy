import { UserButton } from '@clerk/nextjs';
import { hasPermission } from '@luminol/auth';
import {
  getCommonDictionary,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';

import {
  getStaffDestinations,
  type StaffDestinationKey,
} from '../lib/staff-navigation';
import { getStaffNavigationCopy } from '../lib/staff-navigation-localization';
import { AdminLanguageSwitcher } from './admin-language-switcher';

type CrmShellProps = {
  locale: Locale;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    roles: Parameters<typeof hasPermission>[0];
  };
  current: StaffDestinationKey | 'search';
  query?: string | undefined;
  children: ReactNode;
};

/** Shared CRM frame: permission-aware sidebar, scoped search and account. */
export function CrmShell({
  locale,
  user,
  current,
  query,
  children,
}: CrmShellProps) {
  const copy = getStaffNavigationCopy(locale);
  const common = getCommonDictionary(locale);
  const destinations = getStaffDestinations((permission) =>
    hasPermission(user.roles, permission),
  );
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

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
        <p className="admin-label">{copy.crmLabel}</p>
        <nav aria-label={copy.aria}>
          {destinations.map(({ key, href }, index) => (
            <Link
              key={key}
              href={localizeHref(locale, href)}
              className={key === current ? 'active' : undefined}
              aria-current={key === current ? 'page' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>{' '}
              {copy.destination[key]}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-note">
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
            <AdminLanguageSwitcher
              locale={locale}
              label={common.languageSelectorLabel}
            />
            <span dir="auto">{name}</span>
            <UserButton />
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </section>
    </main>
  );
}
