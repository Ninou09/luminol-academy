import { requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import { formatLocalizedNumber, localizeHref } from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../../../components/portal-header';
import {
  getPortalCopy,
  getPortalStatusLabel,
  getSkillLabel,
} from '../../../../lib/portal-localization';
import { getPortalArrow } from '../../../../lib/portal-direction';
import { getPortalRequestLocale } from '../../../../lib/request-locale';

export default async function PlacementResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const portalCopy = getPortalCopy(locale);
  const copy = portalCopy.placement;
  const { attemptId } = await params;
  const attempt = await db.placementAttempt.findFirst({
    where: { id: attemptId, userId: user.id },
    include: {
      assessment: {
        include: { course: { select: { title: true, slug: true } } },
      },
      skillResults: { orderBy: { skill: 'asc' } },
    },
  });

  if (!attempt) notFound();

  const pending = attempt.status === 'IN_PROGRESS';
  const reviewRequired = attempt.status === 'REVIEW_REQUIRED';
  const totalScore =
    attempt.totalScore == null ? null : Number(attempt.totalScore);
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const backLabel =
    locale === 'ar'
      ? 'العودة إلى اللغات'
      : locale === 'fr'
        ? 'Retour aux langues'
        : 'Back to languages';

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <Link className="course-link" href={localizeHref(locale, '/languages')}>
          {getPortalArrow(locale, 'back')} {backLabel}
        </Link>
        <section
          className="dashboard-intro mt-12"
          aria-labelledby="result-title"
        >
          <div>
            <p className="eyebrow">{copy.result}</p>
            <h1 id="result-title">
              {attempt.recommendedLevel
                ? `${copy.levelIs} ${attempt.recommendedLevel}.`
                : copy.resultPending}
            </h1>
            <p dir="auto">
              {attempt.assessment.title} · {attempt.assessment.targetLanguage}
            </p>
          </div>
        </section>

        <section className="summary-grid" aria-label={copy.result}>
          <article>
            <span>{copy.recommendedLevel}</span>
            <strong>{attempt.recommendedLevel ?? '—'}</strong>
          </article>
          <article>
            <span>{copy.totalScore}</span>
            <strong>
              {totalScore == null ? '—' : `${number(totalScore)}%`}
            </strong>
          </article>
          <article>
            <span>{copy.skillAreas}</span>
            <strong>{number(attempt.skillResults.length)}</strong>
          </article>
          <article>
            <span>{copy.status}</span>
            <strong className="text-2xl">
              {getPortalStatusLabel(locale, attempt.status)}
            </strong>
          </article>
        </section>

        {pending ? (
          <div className="empty-state">
            <span className="empty-mark" aria-hidden="true">
              …
            </span>
            <div>
              <h3>{copy.stillInProgress}</h3>
              <p>{copy.completeFirst}</p>
            </div>
            <Link
              href={localizeHref(locale, `/languages/placement/${attempt.id}`)}
            >
              {copy.resume}
            </Link>
          </div>
        ) : (
          <section className="dashboard-section" aria-labelledby="skills-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.skillProfile}</p>
                <h2 id="skills-title">{copy.breakdown}</h2>
              </div>
            </div>

            {reviewRequired ? (
              <div className="mb-6 border border-black/10 bg-white/60 p-5">
                <strong>{copy.instructorReview}</strong>
                <p className="course-note">{copy.reviewBody}</p>
              </div>
            ) : null}

            <div className="course-grid">
              {attempt.skillResults.map((result) => {
                const score = Number(result.score);
                const skillLabel = getSkillLabel(locale, result.skill);
                return (
                  <article className="course-card" key={result.id}>
                    <div className="course-content">
                      <div className="course-meta">
                        <span className="status status-active">
                          {skillLabel}
                        </span>
                        <span>
                          {result.level
                            ? `CEFR ${result.level}`
                            : copy.diagnostic}
                        </span>
                      </div>
                      <h3>{number(score)}%</h3>
                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-label={`${skillLabel} ${copy.totalScore}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={score}
                      >
                        <span
                          style={{
                            width: `${Math.min(100, Math.max(0, score))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {attempt.status === 'COMPLETED' ? (
              <div className="mt-8">
                <Link
                  className="course-link"
                  href={localizeHref(
                    locale,
                    `/courses/${attempt.assessment.course.slug}`,
                  )}
                >
                  {copy.explore}{' '}
                  <bdi dir="auto">{attempt.assessment.course.title}</bdi>{' '}
                  <span aria-hidden="true">
                    {getPortalArrow(locale, 'forward')}
                  </span>
                </Link>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
