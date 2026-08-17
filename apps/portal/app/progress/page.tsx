import { requireUser } from '@luminol/auth';
import { getLearnerLearningAnalytics } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../components/portal-header';
import { getLearnerOutcomesCopy } from '../../lib/learner-outcomes';
import { getPortalRequestLocale } from '../../lib/request-locale';

export default async function LearnerProgressPage() {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getLearnerOutcomesCopy(locale);
  const outcomes = await getLearnerLearningAnalytics(user.id);

  if (!outcomes) notFound();

  const number = (value: number) => formatLocalizedNumber(value, locale);
  const latestActivity = outcomes.lastLearningActivityAt
    ? formatLocalizedDate(outcomes.lastLearningActivityAt, locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : copy.noActivity;

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section className="dashboard-intro" aria-labelledby="outcomes-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="outcomes-title">{copy.title}</h1>
            <p>{copy.intro}</p>
          </div>
        </section>

        <section
          className="summary-grid"
          aria-label={copy.eyebrow}
          data-learner-outcomes
        >
          <article>
            <span>{copy.activeProgrammes}</span>
            <strong>{number(outcomes.activeProgrammes)}</strong>
          </article>
          <article>
            <span>{copy.completedProgrammes}</span>
            <strong>{number(outcomes.completedProgrammes)}</strong>
          </article>
          <article>
            <span>{copy.completedLessons}</span>
            <strong>{number(outcomes.completedLessons)}</strong>
          </article>
          <article>
            <span>{copy.inProgressLessons}</span>
            <strong>{number(outcomes.inProgressLessons)}</strong>
          </article>
          <article>
            <span>{copy.certificatesEarned}</span>
            <strong>{number(outcomes.certificatesEarned)}</strong>
          </article>
          <article>
            <span>{copy.latestActivity}</span>
            <strong>{latestActivity}</strong>
          </article>
        </section>

        <section className="dashboard-section" aria-labelledby="privacy-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.privacyTitle}</p>
              <h2 id="privacy-title">{copy.privacyTitle}</h2>
            </div>
          </div>
          <div className="empty-state">
            <div>
              <p>{copy.privacyBody}</p>
            </div>
            <Link className="course-link" href={localizeHref(locale, '/')}>
              {copy.back}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
