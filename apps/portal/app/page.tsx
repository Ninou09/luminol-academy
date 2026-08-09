import { requireUser } from '@luminol/auth';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';

import { PortalHeader } from '../components/portal-header';
import { getLearnerDashboard } from '../lib/dashboard.server';
import {
  getPortalCopy,
  getPortalStatusLabel,
} from '../lib/portal-localization';
import { getPortalRequestLocale } from '../lib/request-locale';
import { setCertificateVisibility } from './certificates/actions';

const fallbackWebsiteUrl = 'https://luminol-academy-web.vercel.app';

const dashboardExtras = {
  en: {
    enrolled: 'enrolled',
    active: 'Active',
    joined: 'Joined',
    progress: 'progress',
    pending: 'Your programme is being prepared.',
    complete: 'Programme completed—well done.',
    saved: 'Your learning record is saved securely.',
    certificatesEmpty:
      'Completed programme certificates will appear here automatically.',
    certificatePrivacy:
      'Certificates stay private unless you publish them. Publishing displays your synchronized name, programme, issue date and verification status on an unindexed public page. You can withdraw access at any time.',
    footer: 'Learning with lasting impact',
  },
  fr: {
    enrolled: 'inscrits',
    active: 'Actif',
    joined: 'Inscrit le',
    progress: 'progression',
    pending: 'Votre programme est en préparation.',
    complete: 'Programme terminé—bravo.',
    saved: 'Votre dossier d’apprentissage est enregistré en toute sécurité.',
    certificatesEmpty:
      'Les certificats des programmes terminés apparaîtront ici automatiquement.',
    certificatePrivacy:
      'Les certificats restent privés tant que vous ne les publiez pas. La publication affiche votre nom synchronisé, le programme, la date d’émission et le statut de vérification sur une page publique non indexée. Vous pouvez retirer cet accès à tout moment.',
    footer: 'Un apprentissage qui laisse une trace durable',
  },
  ar: {
    enrolled: 'مسجلون',
    active: 'آخر نشاط',
    joined: 'انضم في',
    progress: 'التقدّم',
    pending: 'يتم تحضير برنامجك.',
    complete: 'أكملت البرنامج—أحسنت.',
    saved: 'سجل تعلّمك محفوظ بأمان.',
    certificatesEmpty: 'ستظهر شهادات البرامج المكتملة هنا تلقائياً.',
    certificatePrivacy:
      'تبقى الشهادات خاصة ما لم تنشرها. عند النشر يظهر اسمك المتزامن والبرنامج وتاريخ الإصدار وحالة التحقق في صفحة عامة غير مفهرسة، ويمكنك إيقاف الوصول في أي وقت.',
    footer: 'للتعلّم أثرٌ يدوم',
  },
} as const satisfies Record<
  Locale,
  {
    enrolled: string;
    active: string;
    joined: string;
    progress: string;
    pending: string;
    complete: string;
    saved: string;
    certificatesEmpty: string;
    certificatePrivacy: string;
    footer: string;
  }
>;

function resolveWebsiteUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  try {
    return new URL(configured || fallbackWebsiteUrl).origin;
  } catch {
    return fallbackWebsiteUrl;
  }
}

export default async function Page() {
  const user = await requireUser();
  const locale = await getPortalRequestLocale();
  const copy = getPortalCopy(locale).dashboard;
  const extras = dashboardExtras[locale];
  const dashboard = await getLearnerDashboard(user.id);
  const firstName = user.firstName?.trim();
  const websiteUrl = resolveWebsiteUrl();
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const date = (value: Date) => formatLocalizedDate(value, locale);

  return (
    <main>
      <PortalHeader />

      <div className="dashboard-shell">
        <section className="dashboard-intro" aria-labelledby="dashboard-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="dashboard-title">
              {copy.welcome}
              {firstName ? (
                <>
                  {', '}
                  <bdi dir="auto">{firstName}</bdi>
                </>
              ) : null}
              .
            </h1>
            <p>{copy.intro}</p>
          </div>
          <p className="today">
            <span>{copy.today}</span>
            {formatLocalizedDate(new Date(), locale, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </section>

        <section className="summary-grid" aria-label={copy.eyebrow}>
          <article>
            <span>{copy.activeProgrammes}</span>
            <strong>{number(dashboard.summary.activeCourses)}</strong>
          </article>
          <article>
            <span>{copy.averageProgress}</span>
            <strong>{number(dashboard.summary.averageProgress)}%</strong>
          </article>
          <article>
            <span>{copy.completed}</span>
            <strong>{number(dashboard.summary.completedCourses)}</strong>
          </article>
          <article>
            <span>{copy.certificates}</span>
            <strong>{number(dashboard.summary.validCertificates)}</strong>
          </article>
        </section>

        <section className="dashboard-section" aria-labelledby="courses-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.learning}</p>
              <h2 id="courses-title">{copy.myProgrammes}</h2>
            </div>
            {dashboard.courses.length > 0 ? (
              <span>
                {number(dashboard.courses.length)} {extras.enrolled}
              </span>
            ) : null}
          </div>

          {dashboard.courses.length > 0 ? (
            <div className="course-grid">
              {dashboard.courses.map((course, index) => (
                <article className="course-card" key={course.enrollmentId}>
                  <div className={`course-symbol course-symbol-${index % 3}`}>
                    <span aria-hidden="true">{number(index + 1)}</span>
                  </div>
                  <div className="course-content">
                    <div className="course-meta">
                      <span
                        className={`status status-${course.status.toLowerCase()}`}
                      >
                        {getPortalStatusLabel(locale, course.status)}
                      </span>
                      <span>
                        {course.lastActivityAt
                          ? `${extras.active} ${date(course.lastActivityAt)}`
                          : `${extras.joined} ${date(course.enrolledAt)}`}
                      </span>
                    </div>
                    <h3 dir="auto">{course.title}</h3>
                    <div className="progress-copy">
                      <span>
                        {course.totalLessons > 0
                          ? `${number(course.completedLessons)} / ${number(course.totalLessons)} ${copy.lessons}`
                          : copy.readyToBegin}
                      </span>
                      <strong>{number(course.progress)}%</strong>
                    </div>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label={`${course.title} ${extras.progress}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={course.progress}
                    >
                      <span style={{ width: `${course.progress}%` }} />
                    </div>
                    <p className="course-note">
                      {course.status === 'PENDING'
                        ? extras.pending
                        : course.status === 'COMPLETED'
                          ? extras.complete
                          : extras.saved}
                    </p>
                    {course.status !== 'PENDING' ? (
                      <Link
                        className="course-link"
                        href={localizeHref(locale, `/courses/${course.slug}`)}
                      >
                        {copy.openProgramme} <span aria-hidden="true">→</span>
                      </Link>
                    ) : null}
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
                <h3>{copy.emptyTitle}</h3>
                <p>{copy.emptyBody}</p>
              </div>
              <a
                href={new URL(
                  localizeHref(locale, '/#schools'),
                  websiteUrl,
                ).toString()}
              >
                {copy.discoverProgrammes}
              </a>
            </div>
          )}
        </section>

        <section
          className="dashboard-section certificates-section"
          aria-labelledby="certificates-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.achievements}</p>
              <h2 id="certificates-title">{copy.certificates}</h2>
            </div>
          </div>

          {dashboard.certificates.length > 0 ? (
            <div className="certificate-list">
              {dashboard.certificates.map((certificate) => (
                <article key={certificate.id}>
                  <span className="certificate-seal" aria-hidden="true">
                    L
                  </span>
                  <div>
                    <h3 dir="auto">
                      <Link
                        href={localizeHref(
                          locale,
                          `/certificates/${certificate.id}`,
                        )}
                      >
                        {certificate.course.title}
                      </Link>
                    </h3>
                    <p>
                      {copy.issued} {date(certificate.issuedAt)}
                    </p>
                  </div>
                  <div className="certificate-verification">
                    <span>
                      {certificate.revokedAt
                        ? copy.revoked
                        : certificate.publiclyVisible
                          ? copy.publicVerification
                          : copy.privateVerification}
                    </span>
                    <code dir="ltr">{certificate.verificationId}</code>
                    <div className="certificate-actions">
                      {certificate.publiclyVisible ? (
                        <a
                          href={new URL(
                            localizeHref(
                              locale,
                              `/certificates/${certificate.verificationId}`,
                            ),
                            websiteUrl,
                          ).toString()}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {copy.openVerification}
                        </a>
                      ) : null}
                      {!certificate.revokedAt || certificate.publiclyVisible ? (
                        <form action={setCertificateVisibility}>
                          <input
                            type="hidden"
                            name="certificateId"
                            value={certificate.id}
                          />
                          <input
                            type="hidden"
                            name="visibility"
                            value={
                              certificate.publiclyVisible ? 'private' : 'public'
                            }
                          />
                          <button type="submit">
                            {certificate.publiclyVisible
                              ? copy.makePrivate
                              : copy.publishVerification}
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="certificate-empty">{extras.certificatesEmpty}</p>
          )}
          {dashboard.certificates.length > 0 ? (
            <p className="certificate-privacy-note">
              {extras.certificatePrivacy}
            </p>
          ) : null}
        </section>
      </div>

      <footer>
        <span>© Luminol</span>
        <span>{extras.footer}</span>
      </footer>
    </main>
  );
}
