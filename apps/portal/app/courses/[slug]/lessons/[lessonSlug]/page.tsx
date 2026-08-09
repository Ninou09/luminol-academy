import { requireUser } from '@luminol/auth';
import { formatLocalizedNumber, localizeHref } from '@luminol/localization';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PortalHeader } from '../../../../../components/portal-header';
import { getLearnerLesson } from '../../../../../lib/course.server';
import {
  getLessonTypeLabel,
  getPortalCopy,
} from '../../../../../lib/portal-localization';
import { getPortalRequestLocale } from '../../../../../lib/request-locale';
import { completeLesson } from '../../actions';
import styles from './lesson.module.css';

function getSafeResourceUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const portalCopy = getPortalCopy(locale);
  const copy = portalCopy.lesson;
  const { slug, lessonSlug } = await params;
  const learning = await getLearnerLesson(user.id, slug, lessonSlug);

  if (!learning) notFound();

  const { course, lesson, module, navigation, progress } = learning;
  const resourceUrl = getSafeResourceUrl(lesson.contentUrl);
  const rawNextHref = navigation.next?.slug
    ? `/courses/${course.slug}/lessons/${navigation.next.slug}`
    : `/courses/${course.slug}`;
  const nextHref = localizeHref(locale, rawNextHref);
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const lessonNavigationLabel =
    locale === 'ar'
      ? 'التنقل بين الدروس'
      : locale === 'fr'
        ? 'Navigation entre les leçons'
        : 'Lesson navigation';

  return (
    <main>
      <PortalHeader />

      <div className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label={copy.breadcrumb}>
          <Link href={localizeHref(locale, '/')}>
            {portalCopy.shell.dashboard}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={localizeHref(locale, `/courses/${course.slug}`)}
            dir="auto"
          >
            {course.title}
          </Link>
          <span aria-hidden="true">/</span>
          <span dir="auto">{lesson.title}</span>
        </nav>

        <div className={styles.layout}>
          <article>
            <header className={styles.lessonHeader}>
              <div className={styles.meta}>
                <span>
                  {copy.module} {number(module.position)}
                </span>
                <span>{getLessonTypeLabel(locale, lesson.type)}</span>
                {lesson.durationMinutes ? (
                  <span>
                    {number(lesson.durationMinutes)} {copy.minutes}
                  </span>
                ) : null}
              </div>
              <h1 dir="auto">{lesson.title}</h1>
              {lesson.summary ? <p dir="auto">{lesson.summary}</p> : null}
            </header>

            <section
              className={styles.content}
              aria-labelledby="lesson-content"
            >
              <h2 id="lesson-content">{copy.material}</h2>
              {resourceUrl ? (
                <>
                  <p>{copy.materialBody}</p>
                  <a
                    className={styles.resourceLink}
                    href={resourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {copy.openResource} ↗
                  </a>
                </>
              ) : (
                <p>{copy.pendingBody}</p>
              )}
            </section>

            <nav
              className={styles.navigation}
              aria-label={lessonNavigationLabel}
            >
              {navigation.previous?.slug ? (
                <Link
                  href={localizeHref(
                    locale,
                    `/courses/${course.slug}/lessons/${navigation.previous.slug}`,
                  )}
                >
                  <small>{copy.previous}</small>
                  <span dir="auto">
                    {navigation.previous.slug.replaceAll('-', ' ')}
                  </span>
                </Link>
              ) : (
                <span className={styles.disabled}>
                  <small>{copy.previous}</small>
                  {copy.startOfProgramme}
                </span>
              )}

              {navigation.next?.slug ? (
                <Link href={nextHref}>
                  <small>{copy.next}</small>
                  <span dir="auto">
                    {navigation.next.slug.replaceAll('-', ' ')}
                  </span>
                </Link>
              ) : (
                <Link href={localizeHref(locale, `/courses/${course.slug}`)}>
                  <small>{copy.programme}</small>
                  {copy.reviewCurriculum}
                </Link>
              )}
            </nav>
          </article>

          <aside
            className={styles.sidebar}
            aria-label={copy.lessonsInProgramme}
          >
            <strong>
              {number(navigation.position)}/{number(navigation.total)}
            </strong>
            <span>{copy.lessonsInProgramme}</span>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={`${course.title} ${portalCopy.dashboard.averageProgress}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress.percentage}
            >
              <span style={{ width: `${progress.percentage}%` }} />
            </div>

            {lesson.status === 'COMPLETED' ? (
              <p className={styles.completed}>✓ {copy.completed}</p>
            ) : learning.enrollmentStatus === 'ACTIVE' ? (
              <form action={completeLesson}>
                <input type="hidden" name="lessonId" value={lesson.id} />
                <input type="hidden" name="redirectTo" value={rawNextHref} />
                <button className={styles.primaryAction} type="submit">
                  {copy.completeContinue}
                </button>
              </form>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
