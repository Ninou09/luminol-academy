import { requireUser } from '@luminol/auth';
import Link from 'next/link';

import { parseLearningSearchParam } from '../../lib/learning-search';
import { searchLearnerContent } from '../../lib/learning-search.server';

function labelForKind(kind: 'programme' | 'module' | 'lesson') {
  if (kind === 'programme') return 'Programme';
  if (kind === 'module') return 'Module';
  return 'Lesson';
}

function destinationLabelForKind(kind: 'programme' | 'module' | 'lesson') {
  if (kind === 'module') return 'programme containing this module';
  return labelForKind(kind).toLowerCase();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const rawQuery = parseLearningSearchParam(params.q);
  const { query, results } = await searchLearnerContent(user.id, rawQuery);

  return (
    <main>
      <div className="dashboard-shell">
        <Link href="/">← Dashboard</Link>

        <section className="dashboard-section" aria-labelledby="search-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Search & discovery</p>
              <h1 id="search-title">Search my learning</h1>
            </div>
          </div>

          <p>
            Search only the programmes, modules and lessons available inside
            your secure learner account.
          </p>

          <form action="/search" method="get" role="search">
            <label htmlFor="learning-search">Search your learning</label>
            <div>
              <input
                id="learning-search"
                name="q"
                type="search"
                dir="auto"
                defaultValue={query}
                maxLength={120}
                minLength={2}
                placeholder="Try a lesson, topic or programme"
              />
              <button type="submit">Search</button>
            </div>
          </form>
        </section>

        {query.length >= 2 ? (
          <section className="dashboard-section" aria-live="polite">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Results</p>
                <h2>
                  {results.length > 0
                    ? `Showing ${results.length} result${results.length === 1 ? '' : 's'}`
                    : 'No matches yet'}
                </h2>
              </div>
              <span>
                For “<bdi dir="auto">{query}</bdi>”
              </span>
            </div>

            {results.length > 0 ? (
              <div className="course-grid">
                {results.map((result) => (
                  <article
                    className="course-card"
                    key={`${result.kind}:${result.href}:${result.title}`}
                  >
                    <div className="course-content">
                      <div className="course-meta">
                        <span className="status">
                          {labelForKind(result.kind)}
                        </span>
                        <span dir="auto">{result.courseTitle}</span>
                      </div>
                      <h3 dir="auto">{result.title}</h3>
                      {result.moduleTitle && result.kind === 'lesson' ? (
                        <p className="course-note" dir="auto">
                          {result.moduleTitle}
                        </p>
                      ) : null}
                      {result.body ? (
                        <p className="course-note" dir="auto">
                          {result.body}
                        </p>
                      ) : null}
                      <Link className="course-link" href={result.href}>
                        Open {destinationLabelForKind(result.kind)}{' '}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-mark" aria-hidden="true">
                  ✦
                </span>
                <div>
                  <h3>
                    Nothing in your enrolled learning matches that search.
                  </h3>
                  <p>
                    Try a shorter topic, lesson title, module name or programme
                    name.
                  </p>
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
