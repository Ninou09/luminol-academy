import { requireUser } from '@luminol/auth';
import { recordSearchTelemetry, SearchSurface } from '@luminol/database';
import {
  formatLocalizedNumber,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';

import { PortalHeader } from '../../components/portal-header';
import { parseLearningSearchParam } from '../../lib/learning-search';
import { searchLearnerContent } from '../../lib/learning-search.server';
import { getPortalCopy } from '../../lib/portal-localization';
import { getPortalRequestLocale } from '../../lib/request-locale';

const searchExtras = {
  en: {
    dashboard: 'Dashboard',
    showing: 'Showing',
    result: 'result',
    results: 'results',
    forQuery: 'For',
    noMatches: 'No matches yet',
    moduleDestination: 'programme containing this module',
    emptyTitle: 'Nothing in your enrolled learning matches that search.',
    emptyBody: 'Try a shorter topic, lesson title, module name or programme name.',
  },
  fr: {
    dashboard: 'Tableau de bord',
    showing: 'Affichage de',
    result: 'résultat',
    results: 'résultats',
    forQuery: 'Pour',
    noMatches: 'Aucun résultat',
    moduleDestination: 'programme contenant ce module',
    emptyTitle: 'Aucun contenu de vos formations ne correspond à cette recherche.',
    emptyBody: 'Essayez un sujet plus court, un titre de leçon, un module ou un programme.',
  },
  ar: {
    dashboard: 'لوحة التعلّم',
    showing: 'عرض',
    result: 'نتيجة',
    results: 'نتائج',
    forQuery: 'للبحث',
    noMatches: 'لا توجد نتائج',
    moduleDestination: 'البرنامج الذي يحتوي هذه الوحدة',
    emptyTitle: 'لا يوجد في تعلّمك المسجل ما يطابق هذا البحث.',
    emptyBody: 'جرّب موضوعاً أقصر أو اسم درس أو وحدة أو برنامج.',
  },
} as const satisfies Record<Locale, Record<string, string>>;

function labelForKind(
  locale: Locale,
  kind: 'programme' | 'module' | 'lesson',
) {
  const copy = getPortalCopy(locale).search;
  if (kind === 'programme') return copy.programme;
  if (kind === 'module') return copy.module;
  return copy.lesson;
}

function destinationLabelForKind(
  locale: Locale,
  kind: 'programme' | 'module' | 'lesson',
) {
  if (kind === 'module') return searchExtras[locale].moduleDestination;
  return labelForKind(locale, kind);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getPortalCopy(locale).search;
  const extras = searchExtras[locale];
  const params = await searchParams;
  const rawQuery = parseLearningSearchParam(params.q);
  const { query, results, totalMatches } = await searchLearnerContent(
    user.id,
    rawQuery,
  );

  if (query.length >= 2) {
    await recordSearchTelemetry({
      surface: SearchSurface.LEARNER,
      resultCount: totalMatches,
    });
  }

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <Link href={localizeHref(locale, '/')}>← {extras.dashboard}</Link>

        <section className="dashboard-section" aria-labelledby="search-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1 id="search-title">{copy.title}</h1>
            </div>
          </div>

          <p>{copy.intro}</p>

          <form
            action={localizeHref(locale, '/search')}
            method="get"
            role="search"
          >
            <label htmlFor="learning-search">{copy.label}</label>
            <div>
              <input
                id="learning-search"
                name="q"
                type="search"
                dir="auto"
                defaultValue={query}
                maxLength={120}
                minLength={2}
                placeholder={copy.placeholder}
              />
              <button type="submit">{copy.action}</button>
            </div>
          </form>
        </section>

        {query.length >= 2 ? (
          <section className="dashboard-section" aria-live="polite">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.results}</p>
                <h2>
                  {results.length > 0
                    ? `${extras.showing} ${formatLocalizedNumber(results.length, locale)} ${results.length === 1 ? extras.result : extras.results}`
                    : extras.noMatches}
                </h2>
              </div>
              <span>
                {extras.forQuery} “<bdi dir="auto">{query}</bdi>”
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
                          {labelForKind(locale, result.kind)}
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
                      <Link
                        className="course-link"
                        href={localizeHref(locale, result.href)}
                      >
                        {copy.open} {destinationLabelForKind(locale, result.kind)}{' '}
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
                  <h3>{extras.emptyTitle}</h3>
                  <p>{extras.emptyBody}</p>
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
