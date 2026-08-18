import {
  formatLocalizedDate,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { PortalHeader } from '../../components/portal-header';
import { getProfessionalSubmissionCopy } from '../../lib/professional-submission-localization';
import {
  getLearnerProfessionalProjects,
  isLearnerSubmissionEditable,
} from '../../lib/professional-submissions.server';
import { getPortalRequestLocale } from '../../lib/request-locale';
import {
  createProfessionalSubmissionDraft,
  saveProfessionalSubmissionDraft,
  submitProfessionalSubmission,
} from './actions';
import styles from './page.module.css';

function getSafeHttpHref(value: string | null) {
  if (!value || /\s/.test(value)) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default async function LearnerProjectsPage() {
  const locale = await getPortalRequestLocale();
  const copy = getProfessionalSubmissionCopy(locale);
  const { projects } = await getLearnerProfessionalProjects();
  const date = (value: Date) =>
    formatLocalizedDate(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <main>
      <PortalHeader />
      <div className="dashboard-shell">
        <section className="dashboard-intro" aria-labelledby="projects-title">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="projects-title">{copy.title}</h1>
            <p>{copy.intro}</p>
            <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
          </div>
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="available-projects-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.status}</p>
              <h2 id="available-projects-title">{copy.available}</h2>
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="course-grid">
              {projects.map((project) => {
                const editable = isLearnerSubmissionEditable(project.status);
                const safeArtifactHref = getSafeHttpHref(project.artifactUrl);

                return (
                  <article className="course-card" key={project.projectId}>
                    <div className="course-content">
                      <div className="course-meta">
                        <span>
                          {project.status
                            ? copy.statuses[project.status]
                            : copy.available}
                        </span>
                      </div>
                      <h3 dir="auto">{project.projectTitle}</h3>
                      <p dir="auto">
                        {copy.programme}: {project.courseTitle}
                      </p>

                      {!project.submissionId ? (
                        <form action={createProfessionalSubmissionDraft}>
                          <input
                            type="hidden"
                            name="projectId"
                            value={project.projectId}
                          />
                          <button className={styles.startButton} type="submit">
                            {copy.startDraft}
                          </button>
                        </form>
                      ) : editable ? (
                        <form
                          className={styles.form}
                          action={saveProfessionalSubmissionDraft}
                        >
                          <input
                            type="hidden"
                            name="submissionId"
                            value={project.submissionId}
                          />
                          <label>
                            <span>{copy.artifactUrl}</span>
                            <input
                              type="url"
                              name="artifactUrl"
                              defaultValue={project.artifactUrl ?? ''}
                              maxLength={2048}
                              inputMode="url"
                              autoComplete="off"
                              dir="ltr"
                            />
                            <small>{copy.artifactHint}</small>
                          </label>
                          <label>
                            <span>{copy.reflection}</span>
                            <textarea
                              name="reflection"
                              defaultValue={project.reflection ?? ''}
                              maxLength={5000}
                              rows={7}
                              dir="auto"
                            />
                            <small>{copy.reflectionHint}</small>
                          </label>
                          <div className={styles.actions}>
                            <button type="submit">{copy.saveDraft}</button>
                            <button
                              type="submit"
                              formAction={submitProfessionalSubmission}
                            >
                              {project.status === 'REVISION_REQUIRED'
                                ? copy.resubmit
                                : copy.submit}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className={styles.summary}>
                          {safeArtifactHref ? (
                            <a
                              href={safeArtifactHref}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {copy.openArtifact}
                            </a>
                          ) : null}
                          {project.reflection ? (
                            <p dir="auto">{project.reflection}</p>
                          ) : null}
                          {project.submittedAt ? (
                            <p>
                              {copy.submittedOn}: {date(project.submittedAt)}
                            </p>
                          ) : null}
                          {project.reviewedAt ? (
                            <p>
                              {copy.reviewedOn}: {date(project.reviewedAt)}
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>{copy.noProjects}</p>
            </div>
          )}
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="project-privacy-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{copy.privacyTitle}</p>
              <h2 id="project-privacy-title">{copy.privacyTitle}</h2>
            </div>
          </div>
          <p>{copy.privacyBody}</p>
        </section>
      </div>
    </main>
  );
}
