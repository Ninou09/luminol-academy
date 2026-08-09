'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { displayPersonName, formatEnumLabel } from '../../lib/operations';
import { submitAdminSearch } from './actions';
import styles from './page.module.css';
import { EMPTY_ADMIN_SEARCH_STATE } from './search-state';

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function ResultLimitNote({ hasMore }: { hasMore: boolean }) {
  return hasMore ? <span>Showing the first 20 matches</span> : null;
}

export function AdminSearchWorkspace() {
  const [state, formAction, pending] = useActionState(
    submitAdminSearch,
    EMPTY_ADMIN_SEARCH_STATE,
  );
  const shownCount =
    state.people.items.length +
    state.enquiries.items.length +
    state.courses.items.length;

  return (
    <div className={styles.content}>
      <section className={styles.intro} aria-labelledby="admin-search-title">
        <p className="eyebrow">Search & discovery</p>
        <h1 id="admin-search-title">Find operational records.</h1>
        <p>
          Search active people, enquiry identity and routing metadata, and the
          course portfolio without exposing enquiry messages or private learning
          content.
        </p>

        <form
          action={formAction}
          role="search"
          className={styles.form}
          autoComplete="off"
        >
          <label htmlFor="admin-search">Search administration records</label>
          <div>
            <input
              key={state.query}
              id="admin-search"
              name="q"
              type="search"
              dir="auto"
              defaultValue={state.query}
              minLength={2}
              maxLength={120}
              autoComplete="off"
              spellCheck={false}
              placeholder="Try a name, email, course title or slug"
            />
            <button type="submit" disabled={pending}>
              {pending ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>
      </section>

      {state.searched ? (
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
              For “<bdi dir="auto">{state.query}</bdi>”
            </span>
          </div>

          <section className={styles.group} aria-labelledby="people-results">
            <div className={styles.groupHeading}>
              <h3 id="people-results">People</h3>
              <ResultLimitNote hasMore={state.people.hasMore} />
            </div>
            {state.people.items.length > 0 ? (
              <div className={styles.cards}>
                {state.people.items.map((person) => (
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
                      {dateFormatter.format(new Date(person.createdAt))}
                    </span>
                    <Link href="/#learners">Open learner operations</Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>No active people match.</p>
            )}
          </section>

          <section className={styles.group} aria-labelledby="enquiry-results">
            <div className={styles.groupHeading}>
              <h3 id="enquiry-results">Enquiries</h3>
              <ResultLimitNote hasMore={state.enquiries.hasMore} />
            </div>
            {state.enquiries.items.length > 0 ? (
              <div className={styles.cards}>
                {state.enquiries.items.map((enquiry) => (
                  <article key={enquiry.id}>
                    <h4 dir="auto">{enquiry.name}</h4>
                    <p dir="auto">{enquiry.email}</p>
                    <span>
                      {formatEnumLabel(enquiry.school)} ·{' '}
                      {formatEnumLabel(enquiry.status)} ·{' '}
                      {dateFormatter.format(new Date(enquiry.createdAt))}
                    </span>
                    <Link href="/#enquiries">Open enquiry operations</Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>No enquiry identities match.</p>
            )}
          </section>

          <section className={styles.group} aria-labelledby="course-results">
            <div className={styles.groupHeading}>
              <h3 id="course-results">Programmes</h3>
              <ResultLimitNote hasMore={state.courses.hasMore} />
            </div>
            {state.courses.items.length > 0 ? (
              <div className={styles.cards}>
                {state.courses.items.map((course) => (
                  <article key={course.id}>
                    <h4 dir="auto">{course.title}</h4>
                    <p dir="auto">/{course.slug}</p>
                    <span>
                      {course.published ? 'Published' : 'Draft'} · Updated{' '}
                      {dateFormatter.format(new Date(course.updatedAt))}
                    </span>
                    <Link href="/#programmes">Open programme operations</Link>
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
            workspace and protected search terms are submitted in the request
            body rather than the URL.
          </p>
        </section>
      )}
    </div>
  );
}
