import { hasPermission } from '@luminol/auth';
import { localizeHref, type Locale } from '@luminol/localization';
import Link from 'next/link';

import {
  getStaffDestinations,
  type StaffDestinationKey,
} from '../lib/staff-navigation';
import { getStaffNavigationCopy } from '../lib/staff-navigation-localization';

type StaffNavigationProps = {
  locale: Locale;
  roles: Parameters<typeof hasPermission>[0];
  current: StaffDestinationKey;
};

export function StaffNavigation({
  locale,
  roles,
  current,
}: StaffNavigationProps) {
  const copy = getStaffNavigationCopy(locale);
  const destinations = getStaffDestinations((permission) =>
    hasPermission(roles, permission),
  );

  return (
    <nav className="staff-navigation" aria-label={copy.aria}>
      {destinations.map(({ key, href }) => (
        <Link
          key={key}
          href={localizeHref(locale, href)}
          aria-current={key === current ? 'page' : undefined}
        >
          {copy.destination[key]}
        </Link>
      ))}
    </nav>
  );
}
