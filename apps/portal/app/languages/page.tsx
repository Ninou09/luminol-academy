import { UserButton } from '@clerk/nextjs';
import { requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { startPlacementFromForm } from './actions';

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase().replaceAll('_', ' ');
}

export default async function LanguagesPage() {
  const user = await requireUser();
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

  return (
    <main>
      <header className="portal-header">
        <Link href="/" className="brand-link" aria-label="Luminol learner home">
          <Wordmark />
        </Link>
        <div className="portal-account">
          <Link href="/" className="text-sm no-underline">Dashboard</Link>
          <UserButton />
        </div>
      </header>

      <div className="dashboard-shell">
        <section className="dashboard-intro" aria-labelledby="language-title">
          <div>
            <p className="eyebrow">Language learning</p>
            <h1 id="language-title">Find your starting level.</h1>
            <p>
              Take a secure CEFR placement assessment and receive a clear view of
              your reading, listening, speaking, writing, grammar and vocabulary.
            </p>
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="assessments-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Placement</p>
              <h2 id="assessments-title">Available assessments</h2>
            </div>
            <span>{assessments.length} available</span>
          </div>

          {assessments.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">A1</span>
              <div>
                <h3>Placement assessments are being prepared.</h3>
                <p>Your language programmes will appear here as soon as they are published.</p>
              </div>
            </div>
          ) : (
            <div className="course-grid">
              {assessments.map((assessment, index) => {
                const latest = assessment.attempts[0];
                const isActive = latest?.status === 'IN_PROGRESS';
                const hasResult = latest?.status === 'COMPLETED' || latest?.status === 'REVIEW_REQUIRED';

                return (
                  <article className="course-card" key={assessment.id}>
                    <div className={`course-symbol course-symbol-${index % 3}`}>
                      <span aria-hidden="true">{assessment.targetLanguage.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="course-content">
                      <div className="course-meta">
                        <span className="status status-active">CEFR placement</span>
                        <span>Version {assessment.version}</span>
                      </div>
                      <h3>{assessment.title}</h3>
                      <p className="course-note">
                        {assessment.course.title} · {assessment.targetLanguage}
                        {assessment.timeLimitMinutes
                          ? ` · ${assessment.timeLimitMinutes} minutes`
                          : ' · Untimed'}
                      </p>

                      {latest && (
                        <p className="course-note">
                          Latest attempt: {formatStatus(latest.status)}
                          {latest.recommendedLevel ? ` · Level ${latest.recommendedLevel}` : ''}
                        </p>
                      )}

                      {hasResult && latest ? (
                        <Link className="course-link" href={`/languages/results/${latest.id}`}>
                          View result <span aria-hidden="true">→</span>
                        </Link>
                      ) : isActive && latest ? (
                        <Link className="course-link" href={`/languages/placement/${latest.id}`}>
                          Resume assessment <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <form action={startPlacementFromForm}>
                          <input type="hidden" name="assessmentId" value={assessment.id} />
                          <button className="course-link" type="submit">
                            Start assessment <span aria-hidden="true">→</span>
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
