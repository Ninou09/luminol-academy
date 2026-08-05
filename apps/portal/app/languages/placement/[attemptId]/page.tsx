import { requireUser } from '@luminol/auth';
import { db } from '@luminol/database';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function PlacementSessionPage({
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
        include: { course: { select: { title: true } } },
      },
    },
  });

  if (!attempt) notFound();
  if (attempt.status !== 'IN_PROGRESS') {
    redirect(`/languages/results/${attempt.id}`);
  }

  return (
    <main>
      <div className="dashboard-shell">
        <Link className="course-link" href="/languages">
          ← Back to languages
        </Link>
        <section
          className="dashboard-intro mt-12"
          aria-labelledby="placement-title"
        >
          <div>
            <p className="eyebrow">Placement session</p>
            <h1 id="placement-title">{attempt.assessment.title}</h1>
            <p>
              {attempt.assessment.course.title} ·{' '}
              {attempt.assessment.targetLanguage}
            </p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="course-card">
            <div className="course-content">
              <p className="eyebrow">Before you begin</p>
              <h2 className="text-3xl font-medium">
                A fair, focused assessment
              </h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold">Six skill areas</h3>
                  <p className="course-note">
                    Reading, listening, speaking, writing, grammar and
                    vocabulary contribute to your CEFR recommendation.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Progress is protected</h3>
                  <p className="course-note">
                    Your attempt belongs only to your synchronized learner
                    account. Submitted assessments are locked against further
                    edits.
                  </p>
                </div>
              </div>
              <div className="mt-8 border-t border-black/10 pt-6">
                <p className="course-note">
                  Assessment questions are published through the instructor
                  authoring workflow. This session is ready and will resume here
                  when content is available.
                </p>
                {attempt.assessment.timeLimitMinutes && (
                  <p className="course-note">
                    Time limit: {attempt.assessment.timeLimitMinutes} minutes
                    after the first question.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
