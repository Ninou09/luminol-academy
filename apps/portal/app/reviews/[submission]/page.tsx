import { formatLocalizedDate, localizeHref } from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../../components/portal-header';
import { getProfessionalReviewerCopy } from '../../../lib/professional-reviewer-localization';
import { getAssignedProfessionalSubmissionDetail } from '../../../lib/professional-reviewer.server';
import { getPortalRequestLocale } from '../../../lib/request-locale';
import styles from '../page.module.css';

type ReviewerSubmissionPageProps = {
  params: Promise<{ submission: string }>;
};

function getSafeArtifactHref(value: string | null) {
  if (!value || /\s/.test(value)) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default async function ReviewerSubmissionPage({
  params,
}: ReviewerSubmissionPageProps) {
  const [{ submission: submissionId }, locale] = await Promise.all([
    params,
    getPortalRequestLocale(),
  ]);
  const submission =
    await getAssignedProfessionalSubmissionDetail(submissionId);
  if (!submission) notFound();

  const copy = getProfessionalReviewerCopy(locale);
  const artifactHref = getSafeArtifactHref(submission.artifactUrl);
  const date = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section
          className="dashboard-intro"
          aria-labelledby="review-detail-title"
        >
          <div>
            <p className="eyebrow">{copy.detailEyebrow}</p>
            <h1 id="review-detail-title" dir="auto">
              {submission.projectTitle}
            </h1>
            <p dir="auto">
              {copy.programme}: {submission.courseTitle}
            </p>
            <div className={styles.meta}>
              <span>
                {copy.status}: {copy.statuses[submission.status]}
              </span>
              {submission.submittedAt ? (
                <span>
                  {copy.submitted}: {date(submission.submittedAt)}
                </span>
              ) : null}
              <span>
                {copy.updated}: {date(submission.updatedAt)}
              </span>
            </div>
            <Link href={localizeHref(locale, '/reviews')}>
              {copy.backToReviews}
            </Link>
          </div>
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="review-content-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.project}</p>
              <h2 id="review-content-title">{copy.detailEyebrow}</h2>
            </div>
          </div>
          <div className={styles.detailGrid}>
            <article className={styles.detailCard}>
              <h2>{copy.artifact}</h2>
              {artifactHref ? (
                <a
                  className={styles.link}
                  href={artifactHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {copy.openArtifact}
                </a>
              ) : (
                <p>{copy.noArtifact}</p>
              )}
            </article>

            <article className={styles.detailCard}>
              <h2>{copy.reflection}</h2>
              {submission.reflection ? (
                <p className={styles.reflection} dir="auto">
                  {submission.reflection}
                </p>
              ) : (
                <p>{copy.noReflection}</p>
              )}
            </article>
          </div>
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="review-readonly-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.readOnlyTitle}</p>
              <h2 id="review-readonly-title">{copy.readOnlyTitle}</h2>
            </div>
          </div>
          <p>{copy.readOnlyBody}</p>
        </section>
      </div>
    </main>
  );
}
