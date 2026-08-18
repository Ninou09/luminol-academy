import { formatLocalizedDate, localizeHref } from '@luminol/localization';
import Link from 'next/link';

import { PortalHeader } from '../../components/portal-header';
import { getProfessionalReviewerCopy } from '../../lib/professional-reviewer-localization';
import {
  getAssignedProfessionalSubmissions,
  isActiveReviewerWork,
} from '../../lib/professional-reviewer.server';
import { getPortalRequestLocale } from '../../lib/request-locale';
import styles from './page.module.css';

export default async function ProfessionalReviewsPage() {
  const locale = await getPortalRequestLocale();
  const copy = getProfessionalReviewerCopy(locale);
  const { submissions } = await getAssignedProfessionalSubmissions();
  const active = submissions.filter((submission) =>
    isActiveReviewerWork(submission.status),
  );
  const history = submissions.filter(
    (submission) => !isActiveReviewerWork(submission.status),
  );
  const date = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderSubmission = (submission: (typeof submissions)[number]) => (
    <article className={styles.card} key={submission.submissionId}>
      <div className="course-meta">
        <span>{copy.statuses[submission.status]}</span>
      </div>
      <h3 dir="auto">{submission.projectTitle}</h3>
      <p dir="auto">
        {copy.programme}: {submission.courseTitle}
      </p>
      <div className={styles.meta}>
        {submission.submittedAt ? (
          <span>
            {copy.submitted}: {date(submission.submittedAt)}
          </span>
        ) : null}
        <span>
          {copy.updated}: {date(submission.updatedAt)}
        </span>
      </div>
      <Link
        className={styles.link}
        href={localizeHref(locale, `/reviews/${submission.submissionId}`)}
      >
        {copy.open}
      </Link>
    </article>
  );

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section className="dashboard-intro" aria-labelledby="reviews-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="reviews-title">{copy.title}</h1>
            <p>{copy.intro}</p>
            <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="review-queue-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.status}</p>
              <h2 id="review-queue-title">{copy.queue}</h2>
            </div>
          </div>
          {active.length > 0 ? (
            <div className={styles.list}>{active.map(renderSubmission)}</div>
          ) : (
            <div className="empty-state">
              <p>{copy.noQueue}</p>
            </div>
          )}
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="review-history-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.project}</p>
              <h2 id="review-history-title">{copy.history}</h2>
            </div>
          </div>
          {history.length > 0 ? (
            <div className={styles.list}>{history.map(renderSubmission)}</div>
          ) : (
            <div className="empty-state">
              <p>{copy.noHistory}</p>
            </div>
          )}
        </section>

        <section className="dashboard-section" aria-labelledby="review-privacy-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.privacyTitle}</p>
              <h2 id="review-privacy-title">{copy.privacyTitle}</h2>
            </div>
          </div>
          <p>{copy.privacyBody}</p>
        </section>
      </div>
    </main>
  );
}
