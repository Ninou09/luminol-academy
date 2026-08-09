import { requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import { formatLocalizedNumber, localizeHref } from '@luminol/localization';
import Link from 'next/link';

import { PortalHeader } from '../../components/portal-header';
import {
  getPortalCopy,
  getPortalStatusLabel,
} from '../../lib/portal-localization';
import { getPortalRequestLocale } from '../../lib/request-locale';
import { startPlacementFromForm } from './actions';

export default async function LanguagesPage() {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const portalCopy = getPortalCopy(locale);
  const copy = portalCopy.languages;
  const assessments = await db.placementAssessment.findMany({
    where: { published: true },
    orderBy: [{ targetLanguage: 'asc' }, { version: 'desc' }],
    include: {
      course: { select: { title: true, slug: true } },
      attempts: {
        where: { userId: user.id },
        orderBy: { startedAt: 'desc' },
        take: 1,
        select: {
          id: true,
          status: true,
          recommendedLevel: true,
          totalScore: true,
          startedAt: true,
        },
      },
    },
  });
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const placementLabel =
    locale === 'ar'
      ? 'تحديد مستوى CEFR'
      : locale === 'fr'
        ? 'Positionnement CECR'
        : 'CEFR placement';

  return (
    <main>
      <PortalHeader />

      <div className="dashboard-shell">
        <section className="dashboard-intro" aria-labelledby="language-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="language-title">{copy.title}</h1>
            <p>{copy.intro}</p>
          </div>
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="assessments-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.placement}</p>
              <h2 id="assessments-title">{copy.availableAssessments}</h2>
            </div>
            <span>
              {number(assessments.length)} {copy.available}
            </span>
          </div>

          {assessments.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">
                A1
              </span>
              <div>
                <h3>{copy.emptyTitle}</h3>
                <p>{copy.emptyBody}</p>
              </div>
            </div>
          ) : (
            <div className="course-grid">
              {assessments.map((assessment, index) => {
                const latest = assessment.attempts[0];
                const isActive = latest?.status === 'IN_PROGRESS';
                const hasResult =
                  latest?.status === 'COMPLETED' ||
                  latest?.status === 'REVIEW_REQUIRED';

                return (
                  <article className="course-card" key={assessment.id}>
                    <div className={`course-symbol course-symbol-${index % 3}`}>
                      <span aria-hidden="true">
                        {assessment.targetLanguage.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="course-content">
                      <div className="course-meta">
                        <span className="status status-active">
                          {placementLabel}
                        </span>
                        <span>
                          {copy.version} {number(assessment.version)}
                        </span>
                      </div>
                      <h3 dir="auto">{assessment.title}</h3>
                      <p className="course-note" dir="auto">
                        {assessment.course.title} · {assessment.targetLanguage}
                        {assessment.timeLimitMinutes
                          ? ` · ${number(assessment.timeLimitMinutes)} ${portalCopy.lesson.minutes}`
                          : ` · ${copy.untimed}`}
                      </p>

                      {latest ? (
                        <p className="course-note">
                          {copy.latestAttempt}:{' '}
                          {getPortalStatusLabel(locale, latest.status)}
                          {latest.recommendedLevel
                            ? ` · ${copy.level} ${latest.recommendedLevel}`
                            : ''}
                        </p>
                      ) : null}

                      {hasResult && latest ? (
                        <Link
                          className="course-link"
                          href={localizeHref(
                            locale,
                            `/languages/results/${latest.id}`,
                          )}
                        >
                          {copy.viewResult} <span aria-hidden="true">→</span>
                        </Link>
                      ) : isActive && latest ? (
                        <Link
                          className="course-link"
                          href={localizeHref(
                            locale,
                            `/languages/placement/${latest.id}`,
                          )}
                        >
                          {copy.resume} <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <form action={startPlacementFromForm}>
                          <input
                            type="hidden"
                            name="assessmentId"
                            value={assessment.id}
                          />
                          <button className="course-link" type="submit">
                            {copy.start} <span aria-hidden="true">→</span>
                          </button>
                        </form>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
