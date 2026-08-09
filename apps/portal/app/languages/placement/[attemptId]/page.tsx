import { requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import { formatLocalizedNumber, localizeHref } from '@luminol/localization';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { PortalHeader } from '../../../../components/portal-header';
import { getPortalCopy } from '../../../../lib/portal-localization';
import { getPortalArrow } from '../../../../lib/portal-direction';
import { getPortalRequestLocale } from '../../../../lib/request-locale';

export default async function PlacementSessionPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getPortalCopy(locale).placement;
  const { attemptId } = await params;
  const attempt = await db.placementAttempt.findFirst({
    where: { id: attemptId, userId: user.id },
    include: {
      assessment: {
        include: { course: { select: { title: true } } },
      },
    },
  });

  if (!attempt) notFound();
  if (attempt.status !== 'IN_PROGRESS') {
    redirect(localizeHref(locale, `/languages/results/${attempt.id}`));
  }

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
          aria-labelledby="placement-title"
        >
          <div>
            <p className="eyebrow">{copy.session}</p>
            <h1 id="placement-title" dir="auto">
              {attempt.assessment.title}
            </h1>
            <p dir="auto">
              {attempt.assessment.course.title} ·{' '}
              {attempt.assessment.targetLanguage}
            </p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="course-card">
            <div className="course-content">
              <p className="eyebrow">{copy.beforeBegin}</p>
              <h2 className="text-3xl font-medium">{copy.fairAssessment}</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold">{copy.sixSkills}</h3>
                  <p className="course-note">{copy.sixSkillsBody}</p>
                </div>
                <div>
                  <h3 className="font-semibold">{copy.protectedProgress}</h3>
                  <p className="course-note">{copy.protectedBody}</p>
                </div>
              </div>
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="course-note">{copy.contentPending}</p>
                {attempt.assessment.timeLimitMinutes ? (
                  <p className="course-note">
                    {copy.timeLimit}:{' '}
                    {formatLocalizedNumber(
                      attempt.assessment.timeLimitMinutes,
                      locale,
                    )}{' '}
                    {getPortalCopy(locale).lesson.minutes}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
