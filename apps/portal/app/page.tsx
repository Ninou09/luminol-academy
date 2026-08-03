import { UserButton } from '@clerk/nextjs';
import { requireUser } from '@luminol/auth';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { getLearnerDashboard } from '../lib/dashboard.server';
import { setCertificateVisibility } from './certificates/actions';

const dateFormatter = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
}

export default async function Page() {
  const user = await requireUser();
  const dashboard = await getLearnerDashboard(user.id);
  const firstName = user.firstName?.trim() || 'there';
  const websiteUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ).replace(/\/$/, '');

  return (
    <main>
      <header className="portal-header">
        <Link href="/" className="brand-link" aria-label="Luminol learner home">
          <Wordmark />
        </Link>
        <div className="portal-account">
          <Link href="/notifications">Notifications</Link>
          <Link href="/finance">Billing</Link>
          <Link href="/account">Account</Link>
          <span>Learner portal</span>
          <UserButton />
        </div>
      </header>

      <div className="dashboard-shell">
        <section className="dashboard-intro" aria-labelledby="dashboard-title">
          <div>
            <p className="eyebrow">Your learning space</p>
            <h1 id="dashboard-title">Welcome, {firstName}.</h1>
            <p>
              Continue your programmes, follow your progress and keep every
              achievement in one secure place.
            </p>
          </div>
          <p className="today">
            <span>Today</span>
            {dateFormatter.format(new Date())}
          </p>
        </section>

        <section className="summary-grid" aria-label="Learning summary">
          <article>
            <span>Active programmes</span>
            <strong>{dashboard.summary.activeCourses}</strong>
          </article>
          <article>
            <span>Average progress</span>
            <strong>{dashboard.summary.averageProgress}%</strong>
          </article>
          <article>
            <span>Completed</span>
            <strong>{dashboard.summary.completedCourses}</strong>
          </article>
          <article>
            <span>Certificates</span>
            <strong>{dashboard.summary.validCertificates}</strong>
          </article>
        </section>

        <section className="dashboard-section" aria-labelledby="courses-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Learning</p>
              <h2 id="courses-title">My programmes</h2>
            </div>
            {dashboard.courses.length > 0 && (
              <span>{dashboard.courses.length} enrolled</span>
            )}
          </div>

          {dashboard.courses.length > 0 ? (
            <div className="course-grid">
              {dashboard.courses.map((course, index) => (
                <article className="course-card" key={course.enrollmentId}>
                  <div className={`course-symbol course-symbol-${index % 3}`}>
                    <span aria-hidden="true">0{index + 1}</span>
                  </div>
                  <div className="course-content">
                    <div className="course-meta">
                      <span
                        className={`status status-${course.status.toLowerCase()}`}
                      >
                        {formatStatus(course.status)}
                      </span>
                      <span>
                        {course.lastActivityAt
                          ? `Active ${dateFormatter.format(course.lastActivityAt)}`
                          : `Joined ${dateFormatter.format(course.enrolledAt)}`}
                      </span>
                    </div>
                    <h3>{course.title}</h3>
                    <div className="progress-copy">
                      <span>
                        {course.totalLessons > 0
                          ? `${course.completedLessons} of ${course.totalLessons} lessons`
                          : 'Ready to begin'}
                      </span>
                      <strong>{course.progress}%</strong>
                    </div>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label={`${course.title} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={course.progress}
                    >
                      <span style={{ width: `${course.progress}%` }} />
                    </div>
                    <p className="course-note">
                      {course.status === 'PENDING'
                        ? 'Your programme is being prepared.'
                        : course.status === 'COMPLETED'
                          ? 'Programme completed—well done.'
                          : 'Your learning record is saved securely.'}
                    </p>
                    {course.status !== 'PENDING' && (
                      <Link
                        className="course-link"
                        href={`/courses/${course.slug}`}
                      >
                        Open programme <span aria-hidden="true">→</span>
                      </Link>
                    )}
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
                <h3>Your first programme starts here.</h3>
                <p>
                  Explore psychology, languages and professional training
                  designed around meaningful, lasting growth.
                </p>
              </div>
              <Link href={`${websiteUrl}/#schools`}>Discover programmes</Link>
            </div>
          )}
        </section>

        <section
          className="dashboard-section certificates-section"
          aria-labelledby="certificates-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Achievements</p>
              <h2 id="certificates-title">Certificates</h2>
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
                    <h3>
                      <Link href={`/certificates/${certificate.id}`}>
                        {certificate.course.title}
                      </Link>
                    </h3>
                    <p>Issued {dateFormatter.format(certificate.issuedAt)}</p>
                  </div>
                  <div className="certificate-verification">
                    <span>
                      {certificate.revokedAt
                        ? 'Revoked'
                        : certificate.publiclyVisible
                          ? 'Public verification on'
                          : 'Private'}
                    </span>
                    <code>{certificate.verificationId}</code>
                    <div className="certificate-actions">
                      {certificate.publiclyVisible && (
                        <a
                          href={`${websiteUrl}/certificates/${certificate.verificationId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open verification
                        </a>
                      )}
                      {(!certificate.revokedAt ||
                        certificate.publiclyVisible) && (
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
                              ? 'Make private'
                              : 'Publish verification'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="certificate-empty">
              Completed programme certificates will appear here automatically.
            </p>
          )}
          {dashboard.certificates.length > 0 && (
            <p className="certificate-privacy-note">
              Certificates stay private unless you publish them. Publishing
              displays your synchronized name, programme, issue date and
              verification status on an unindexed public page. You can withdraw
              access at any time.
            </p>
          )}
        </section>
      </div>

      <footer>
        <span>© Luminol</span>
        <span lang="ar" dir="rtl">
          للتعلّم أثرٌ يدوم
        </span>
        <span>Le savoir nous éclaire</span>
      </footer>
    </main>
  );
}
