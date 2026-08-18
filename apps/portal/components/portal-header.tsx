import { UserButton } from '@clerk/nextjs';
import { requireUser } from '@luminol/auth';
import { getCommonDictionary, localizeHref } from '@luminol/localization';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { getInstructorWorkspaceCopy } from '../lib/instructor-workspace-localization';
import { hasInstructorWorkspaceAccess } from '../lib/instructor-workspace.server';
import { getLearnerOutcomesCopy } from '../lib/learner-outcomes';
import { getLearnerSessionScheduleCopy } from '../lib/learner-session-schedule-localization';
import { getOrganizationAnalyticsCopy } from '../lib/organization-analytics-localization';
import { getOrganizationManagerCopy } from '../lib/organization-manager-localization';
import { hasOrganizationManagerAccess } from '../lib/organization-manager.server';
import { getPortalCopy } from '../lib/portal-localization';
import { getProfessionalReviewerCopy } from '../lib/professional-reviewer-localization';
import { hasProfessionalReviewerAccess } from '../lib/professional-reviewer.server';
import { getProfessionalSubmissionCopy } from '../lib/professional-submission-localization';
import { getPortalRequestLocale } from '../lib/request-locale';
import { PortalLanguageSwitcher } from './portal-language-switcher';

export async function PortalHeader() {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getPortalCopy(locale);
  const outcomesCopy = getLearnerOutcomesCopy(locale);
  const scheduleCopy = getLearnerSessionScheduleCopy(locale);
  const projectsCopy = getProfessionalSubmissionCopy(locale);
  const reviewsCopy = getProfessionalReviewerCopy(locale);
  const instructorCopy = getInstructorWorkspaceCopy(locale);
  const managerCopy = getOrganizationManagerCopy(locale);
  const organizationAnalyticsCopy = getOrganizationAnalyticsCopy(locale);
  const common = getCommonDictionary(locale);
  const [canTeachCohorts, canReviewProjects, canManageOrganization] =
    await Promise.all([
      hasInstructorWorkspaceAccess(user.id),
      hasProfessionalReviewerAccess(user.id),
      hasOrganizationManagerAccess(user.id),
    ]);

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
          <Link href={localizeHref(locale, '/schedule')}>
            {scheduleCopy.nav}
          </Link>
          <Link href={localizeHref(locale, '/projects')}>
            {projectsCopy.nav}
          </Link>
          {canReviewProjects ? (
            <Link href={localizeHref(locale, '/reviews')}>
              {reviewsCopy.nav}
            </Link>
          ) : null}
          {canTeachCohorts ? (
            <Link href={localizeHref(locale, '/instructor')}>
              {instructorCopy.nav}
            </Link>
          ) : null}
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
