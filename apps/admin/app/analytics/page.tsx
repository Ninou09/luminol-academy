import {
  ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE,
  type AcademyProgrammeAnalytics,
} from '@luminol/database';
import {
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAcademyAnalyticsCopy } from '../../lib/academy-analytics-localization';
import { getAuthorizedAcademyProgrammeAnalytics } from '../../lib/academy-analytics.server';
import { getAdminRequestLocale } from '../../lib/request-locale';

function visibleProgramme(
  programme: AcademyProgrammeAnalytics,
): programme is Extract<AcademyProgrammeAnalytics, { state: 'visible' }> {
  return programme.state === 'visible';
}

export default async function AcademyAnalyticsPage() {
  const locale = await getAdminRequestLocale();
  const copy = getAcademyAnalyticsCopy(locale);
  const common = getCommonDictionary(locale);
  const analytics = await getAuthorizedAcademyProgrammeAnalytics();
  const visibleProgrammes = analytics.filter(visibleProgramme);
  const suppressedProgrammes = analytics.filter(
    (programme) => programme.state === 'suppressed',
  );
  const number = (value: number) => formatLocalizedNumber(value, locale);

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="metric-grid" aria-label={copy.summaryAria}>
            <article>
              <span>{copy.publishedProgrammes}</span>
              <strong>{number(analytics.length)}</strong>
            </article>
            <article>
              <span>{copy.visibleProgrammes}</span>
              <strong>{number(visibleProgrammes.length)}</strong>
            </article>
            <article>
              <span>{copy.suppressedProgrammes}</span>
              <strong>{number(suppressedProgrammes.length)}</strong>
            </article>
            <article>
              <span>{copy.privacyGuard}</span>
              <strong>{number(ACADEMY_ANALYTICS_MINIMUM_GROUP_SIZE)}</strong>
            </article>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.visibleProgrammes}</p>
                <h2>{copy.tableTitle}</h2>
                <p
                  style={{
                    margin: '0.65rem 0 0',
                    maxWidth: '760px',
                    color: 'var(--color-brand-muted)',
                    lineHeight: 1.6,
                    fontSize: '0.76rem',
                  }}
                >
                  {copy.tableIntro}
                </p>
              </div>
            </div>

            {visibleProgrammes.length > 0 ? (
              <div className="portfolio-table" aria-label={copy.tableTitle}>
                <div
                  className="portfolio-header"
                  aria-hidden="true"
                  style={{
                    gridTemplateColumns:
                      'minmax(220px, 1.4fr) repeat(6, minmax(90px, 0.55fr))',
                  }}
                >
                  <span>{copy.programme}</span>
                  <span>{copy.participants}</span>
                  <span>{copy.active}</span>
                  <span>{copy.completed}</span>
                  <span>{copy.recentActivity}</span>
                  <span>{copy.certificates}</span>
                  <span>{copy.reviews}</span>
                </div>
                {visibleProgrammes.map((programme) => (
                  <article
                    key={programme.courseId}
                    style={{
                      gridTemplateColumns:
                        'minmax(220px, 1.4fr) repeat(6, minmax(90px, 0.55fr))',
                    }}
                  >
                    <h3 dir="auto">{programme.title}</h3>
                    <span>{number(programme.participantCount)}</span>
                    <span>{number(programme.activeEnrollments)}</span>
                    <span>{number(programme.completedEnrollments)}</span>
                    <span>{number(programme.recentLearningRecords)}</span>
                    <span>{number(programme.activeCertificates)}</span>
                    <span>{number(programme.reviewRequiredAttempts)}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">{copy.noProgrammes}</p>
            )}
          </section>

          {suppressedProgrammes.length > 0 ? (
            <section className="admin-panel portfolio-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{copy.suppressedProgrammes}</p>
                  <h2>{copy.suppressedTitle}</h2>
                </div>
              </div>
              <p
                style={{
                  margin: '0 0 1.5rem',
                  color: 'var(--color-brand-muted)',
                  lineHeight: 1.6,
                  fontSize: '0.76rem',
                }}
              >
                {copy.suppressedReason}
              </p>
              <div className="compact-list">
                {suppressedProgrammes.map((programme) => (
                  <article key={programme.courseId}>
                    <div>
                      <h3 dir="auto">{programme.title}</h3>
                    </div>
                    <div>
                      <span className="data-status">{copy.privacyGuard}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="admin-panel portfolio-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{copy.privacyGuard}</p>
                <h2>{copy.privacyTitle}</h2>
              </div>
            </div>
            <p
              style={{
                margin: 0,
                maxWidth: '900px',
                color: 'var(--color-brand-muted)',
                lineHeight: 1.75,
                fontSize: '0.78rem',
              }}
            >
              {copy.privacyBody}
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
