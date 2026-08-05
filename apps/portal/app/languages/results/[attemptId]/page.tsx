import { requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll('_', ' ');
}

export default async function PlacementResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await requireUser();
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
  const totalScore = attempt.totalScore ? Number(attempt.totalScore) : null;

  return (
    <main>
      <div className="dashboard-shell">
        <Link className="course-link" href="/languages">
          ← Back to languages
        </Link>
        <section
          className="dashboard-intro mt-12"
          aria-labelledby="result-title"
        >
          <div>
            <p className="eyebrow">Placement result</p>
            <h1 id="result-title">
              {attempt.recommendedLevel
                ? `Your level is ${attempt.recommendedLevel}.`
                : 'Result pending.'}
            </h1>
            <p>
              {attempt.assessment.title} · {attempt.assessment.targetLanguage}
            </p>
          </div>
        </section>

        <section className="summary-grid" aria-label="Placement summary">
          <article>
            <span>Recommended level</span>
            <strong>{attempt.recommendedLevel ?? '—'}</strong>
          </article>
          <article>
            <span>Total score</span>
            <strong>{totalScore == null ? '—' : `${totalScore}%`}</strong>
          </article>
          <article>
            <span>Skill areas</span>
            <strong>{attempt.skillResults.length}</strong>
          </article>
          <article>
            <span>Status</span>
            <strong className="text-2xl">{label(attempt.status)}</strong>
          </article>
        </section>

        {pending ? (
          <div className="empty-state">
            <span className="empty-mark" aria-hidden="true">
              …
            </span>
            <div>
              <h3>This assessment is still in progress.</h3>
              <p>Complete and submit the assessment before viewing a result.</p>
            </div>
            <Link href={`/languages/placement/${attempt.id}`}>
              Resume assessment
            </Link>
          </div>
        ) : (
          <section className="dashboard-section" aria-labelledby="skills-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Skill profile</p>
                <h2 id="skills-title">Your CEFR breakdown</h2>
              </div>
            </div>

            {reviewRequired && (
              <div className="mb-6 border border-black/10 bg-white/60 p-5">
                <strong>Instructor review in progress</strong>
                <p className="course-note">
                  Productive skills such as speaking or writing may require a
                  qualified instructor before your final level is confirmed.
                </p>
              </div>
            )}

            <div className="course-grid">
              {attempt.skillResults.map((result) => {
                const score = Number(result.score);
                return (
                  <article className="course-card" key={result.id}>
                    <div className="course-content">
                      <div className="course-meta">
                        <span className="status status-active">
                          {label(result.skill)}
                        </span>
                        <span>
                          {result.level ? `CEFR ${result.level}` : 'Diagnostic'}
                        </span>
                      </div>
                      <h3>{score}%</h3>
                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-label={`${label(result.skill)} score`}
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

            {attempt.status === 'COMPLETED' && (
              <div className="mt-8">
                <Link
                  className="course-link"
                  href={`/courses/${attempt.assessment.course.slug}`}
                >
                  Explore {attempt.assessment.course.title}{' '}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
