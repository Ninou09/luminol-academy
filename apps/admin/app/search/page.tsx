import { UserButton } from '@clerk/nextjs';
import { requirePermission } from '@luminol/auth';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { displayPersonName, formatEnumLabel } from '../../lib/operations';
import { parseAdminSearchParam } from '../../lib/operations-search';
import { searchAdminOperations } from '../../lib/operations-search.server';
import styles from './page.module.css';

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function ResultLimitNote({ hasMore }: { hasMore: boolean }) {
  return hasMore ? <span>Showing the first 20 matches</span> : null;
}

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const administrator = await requirePermission('academy:manage');
  const params = await searchParams;
  const rawQuery = parseAdminSearchParam(params.q);
  const results = await searchAdminOperations(rawQuery);
  const administratorName = displayPersonName(
    administrator.firstName,
    administrator.lastName,
    'Administrator',
  );
  const hasSearch = results.query.length >= 2;
  const shownCount =
    results.people.items.length +
    results.enquiries.items.length +
    results.courses.items.length;

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Luminol administration"
        >
          <Wordmark />
        </Link>
        <p className={styles.label}>Administration</p>
        <nav aria-label="Administration search navigation">
          <Link href="/">Overview</Link>
          <Link className={styles.active} href="/search" aria-current="page">
            Search
          </Link>
          <Link href="/finance">Finance</Link>
        </nav>
        <p className={styles.privacyNote}>
          Search is limited to operational identity, enquiry routing and course
          metadata. Enquiry messages and sensitive learning content are not
          searched here.
        </p>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <p>Operations search</p>
            <span>Protected administration workspace</span>
          </div>
          <div className={styles.account}>
            <span>{administratorName}</span>
            <UserButton />
          </div>
        </header>

        <div className={styles.content}>
          <section
            className={styles.intro}
            aria-labelledby="admin-search-title"
          >
            <p className="eyebrow">Search & discovery</p>
            <h1 id="admin-search-title">Find operational records.</h1>
            <p>
              Search active people, enquiry identity and routing metadata, and
              the course portfolio without exposing enquiry messages or private
              learning content.
            </p>

            <form
              action="/search"
              method="get"
              role="search"
              className={styles.form}
            >
              <label htmlFor="admin-search">
                Search administration records
              </label>
              <div>
                <input
                  id="admin-search"
                  name="q"
                  type="search"
                  dir="auto"
                  defaultValue={results.query}
                  minLength={2}
                  maxLength={120}
                  placeholder="Try a name, email, course title or slug"
                />
                <button type="submit">Search</button>
              </div>
            </form>
          </section>

          {hasSearch ? (
            <section className={styles.results} aria-live="polite">
              <div className={styles.resultSummary}>
                <div>
                  <p className="eyebrow">Results</p>
                  <h2>
                    {shownCount > 0
                      ? `${shownCount} result${shownCount === 1 ? '' : 's'} shown`
                      : 'No matching records'}
                  </h2>
                </div>
                <span>
                  For “<bdi dir="auto">{results.query}</bdi>”
                </span>
              </div>

              <section
                className={styles.group}
                aria-labelledby="people-results"
              >
                <div className={styles.groupHeading}>
                  <h3 id="people-results">People</h3>
                  <ResultLimitNote hasMore={results.people.hasMore} />
                </div>
                {results.people.items.length > 0 ? (
                  <div className={styles.cards}>
                    {results.people.items.map((person) => (
                      <article key={person.id}>
                        <h4 dir="auto">
                          {displayPersonName(
                            person.firstName,
                            person.lastName,
                            person.email,
                          )}
                        </h4>
                        <p dir="auto">{person.email}</p>
                        <span>
                          Account created{' '}
                          {dateFormatter.format(person.createdAt)}
                        </span>
                        <Link href="/#learners">Open learner operations</Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.empty}>No active people match.</p>
                )}
              </section>

              <section
                className={styles.group}
                aria-labelledby="enquiry-results"
              >
                <div className={styles.groupHeading}>
                  <h3 id="enquiry-results">Enquiries</h3>
                  <ResultLimitNote hasMore={results.enquiries.hasMore} />
                </div>
                {results.enquiries.items.length > 0 ? (
                  <div className={styles.cards}>
                    {results.enquiries.items.map((enquiry) => (
                      <article key={enquiry.id}>
                        <h4 dir="auto">{enquiry.name}</h4>
                        <p dir="auto">{enquiry.email}</p>
                        <span>
                          {formatEnumLabel(enquiry.school)} ·{' '}
                          {formatEnumLabel(enquiry.status)} ·{' '}
                          {dateFormatter.format(enquiry.createdAt)}
                        </span>
                        <Link href="/#enquiries">Open enquiry operations</Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.empty}>No enquiry identities match.</p>
                )}
              </section>

              <section
                className={styles.group}
                aria-labelledby="course-results"
              >
                <div className={styles.groupHeading}>
                  <h3 id="course-results">Programmes</h3>
                  <ResultLimitNote hasMore={results.courses.hasMore} />
                </div>
                {results.courses.items.length > 0 ? (
                  <div className={styles.cards}>
                    {results.courses.items.map((course) => (
                      <article key={course.id}>
                        <h4 dir="auto">{course.title}</h4>
                        <p dir="auto">/{course.slug}</p>
                        <span>
                          {course.published ? 'Published' : 'Draft'} · Updated{' '}
                          {dateFormatter.format(course.updatedAt)}
                        </span>
                        <Link href="/#programmes">
                          Open programme operations
                        </Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.empty}>No programmes match.</p>
                )}
              </section>
            </section>
          ) : (
            <section className={styles.prompt} aria-live="polite">
              <h2>Enter at least two characters to search.</h2>
              <p>
                Results remain inside this server-authorized administration
                workspace.
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
