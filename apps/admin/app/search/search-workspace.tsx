'use client';

import {
  formatLocalizedNumber,
  getIntlLocale,
  type Locale,
} from '@luminol/localization';
import { useActionState } from 'react';

import {
  getAdminEnumLabel,
  type AdminSearchCopy,
} from '../../lib/admin-localization';
import {
  ADMIN_SEARCH_MAX_QUERY_LENGTH,
  ADMIN_SEARCH_MIN_QUERY_LENGTH,
} from '../../lib/operations-search.constants';
import { displayPersonName } from '../../lib/operations';
import { submitAdminSearch } from './actions';
import styles from './page.module.css';
import { EMPTY_ADMIN_SEARCH_STATE } from './search-state';

function ResultLimitNote({
  hasMore,
  copy,
}: {
  hasMore: boolean;
  copy: AdminSearchCopy;
}) {
  return hasMore ? <span>{copy.firstTwenty}</span> : null;
}

export function AdminSearchWorkspace({
  locale,
  copy,
}: {
  locale: Locale;
  copy: AdminSearchCopy;
}) {
  const [state, formAction, pending] = useActionState(
    submitAdminSearch,
    EMPTY_ADMIN_SEARCH_STATE,
  );
  const shownCount =
    state.people.items.length +
    state.enquiries.items.length +
    state.courses.items.length;
  const dateFormatter = new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={styles.content}>
      <section className={styles.intro} aria-labelledby="admin-search-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="admin-search-title">{copy.title}</h1>
        <p>{copy.intro}</p>

        <form
          action={formAction}
          role="search"
          className={styles.form}
          autoComplete="off"
        >
          <label htmlFor="admin-search">{copy.fieldLabel}</label>
          <div>
            <input
              key={state.query}
              id="admin-search"
              name="q"
              type="search"
              dir="auto"
              defaultValue={state.query}
              minLength={ADMIN_SEARCH_MIN_QUERY_LENGTH}
              maxLength={ADMIN_SEARCH_MAX_QUERY_LENGTH}
              autoComplete="off"
              spellCheck={false}
              placeholder={copy.placeholder}
            />
            <button type="submit" disabled={pending}>
              {pending ? copy.searching : copy.search}
            </button>
          </div>
        </form>
      </section>

      {state.searched ? (
        <section className={styles.results} aria-live="polite">
          <div className={styles.resultSummary}>
            <div>
              <p className="eyebrow">{copy.results}</p>
              <h2>
                {shownCount > 0
                  ? `${formatLocalizedNumber(shownCount, locale)} ${
                      shownCount === 1 ? copy.resultShown : copy.resultsShown
                    }`
                  : copy.noMatchingRecords}
              </h2>
            </div>
            <span>
              {copy.forQuery} “<bdi dir="auto">{state.query}</bdi>”
            </span>
          </div>

          <section className={styles.group} aria-labelledby="people-results">
            <div className={styles.groupHeading}>
              <h3 id="people-results">{copy.people}</h3>
              <ResultLimitNote hasMore={state.people.hasMore} copy={copy} />
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
                      {copy.accountCreated}{' '}
                      {dateFormatter.format(new Date(person.createdAt))}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>{copy.noPeople}</p>
            )}
          </section>

          <section className={styles.group} aria-labelledby="enquiry-results">
            <div className={styles.groupHeading}>
              <h3 id="enquiry-results">{copy.enquiries}</h3>
              <ResultLimitNote hasMore={state.enquiries.hasMore} copy={copy} />
            </div>
            {state.enquiries.items.length > 0 ? (
              <div className={styles.cards}>
                {state.enquiries.items.map((enquiry) => (
                  <article key={enquiry.id}>
                    <h4 dir="auto">{enquiry.name}</h4>
                    <p dir="auto">{enquiry.email}</p>
                    <span>
                      {getAdminEnumLabel(locale, enquiry.school)} ·{' '}
                      {getAdminEnumLabel(locale, enquiry.status)} ·{' '}
                      {dateFormatter.format(new Date(enquiry.createdAt))}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>{copy.noEnquiries}</p>
            )}
          </section>

          <section className={styles.group} aria-labelledby="course-results">
            <div className={styles.groupHeading}>
              <h3 id="course-results">{copy.programmes}</h3>
              <ResultLimitNote hasMore={state.courses.hasMore} copy={copy} />
            </div>
            {state.courses.items.length > 0 ? (
              <div className={styles.cards}>
                {state.courses.items.map((course) => (
                  <article key={course.id}>
                    <h4 dir="auto">{course.title}</h4>
                    <p dir="auto">/{course.slug}</p>
                    <span>
                      {course.published ? copy.published : copy.draft} ·{' '}
                      {copy.updated}{' '}
                      {dateFormatter.format(new Date(course.updatedAt))}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>{copy.noProgrammes}</p>
            )}
          </section>
        </section>
      ) : (
        <section className={styles.prompt} aria-live="polite">
          <h2>{copy.minimumPrompt}</h2>
          <p>{copy.privacyPrompt}</p>
        </section>
      )}
    </div>
  );
}
