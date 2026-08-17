import { UserButton } from '@clerk/nextjs';
import { requireUser } from '@luminol/auth';
import { getCommonDictionary, localizeHref } from '@luminol/localization';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { getLearnerOutcomesCopy } from '../lib/learner-outcomes';
import { getOrganizationAnalyticsCopy } from '../lib/organization-analytics-localization';
import { getOrganizationManagerCopy } from '../lib/organization-manager-localization';
import { hasOrganizationManagerAccess } from '../lib/organization-manager.server';
import { getPortalCopy } from '../lib/portal-localization';
import { getPortalRequestLocale } from '../lib/request-locale';
import { PortalLanguageSwitcher } from './portal-language-switcher';

export async function PortalHeader() {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getPortalCopy(locale);
  const outcomesCopy = getLearnerOutcomesCopy(locale);
  const managerCopy = getOrganizationManagerCopy(locale);
  const organizationAnalyticsCopy = getOrganizationAnalyticsCopy(locale);
  const common = getCommonDictionary(locale);
  const canManageOrganization = await hasOrganizationManagerAccess(user.id);

  return (
    <header className="portal-header">
      <Link
        href={localizeHref(locale, '/')}
        className="brand-link"
        aria-label={copy.shell.homeAria}
      >
        <Wordmark />
      </Link>
      <div className="portal-account">
        <nav className="portal-nav" aria-label={copy.shell.portal}>
          <Link href={localizeHref(locale, '/')}>{copy.shell.dashboard}</Link>
          <Link href={localizeHref(locale, '/progress')}>
            {outcomesCopy.nav}
          </Link>
          <Link href={localizeHref(locale, '/search')}>
            {copy.shell.search}
          </Link>
          {canManageOrganization ? (
            <>
              <Link href={localizeHref(locale, '/organization')}>
                {managerCopy.nav}
              </Link>
              <Link href={localizeHref(locale, '/organization/analytics')}>
                {organizationAnalyticsCopy.title}
              </Link>
            </>
          ) : null}
          <Link href={localizeHref(locale, '/notifications')}>
            {copy.shell.notifications}
          </Link>
          <Link href={localizeHref(locale, '/finance')}>
            {copy.shell.billing}
          </Link>
          <Link href={localizeHref(locale, '/account')}>
            {copy.shell.account}
          </Link>
        </nav>
        <PortalLanguageSwitcher
          locale={locale}
          label={common.languageSelectorLabel}
        />
        <span>{copy.shell.portal}</span>
        <UserButton />
      </div>
    </header>
  );
}
