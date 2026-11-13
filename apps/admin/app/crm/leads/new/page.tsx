import { localizeHref } from '@luminol/localization';
import { crmQuickLeadSources } from '@luminol/validation/crm-sections';
import { enquirySchoolSchema } from '@luminol/validation';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CrmShell } from '../../../../components/crm-shell';
import styles from '../../../../components/operations.module.css';
import { getAdminEnumLabel } from '../../../../lib/admin-localization';
import { requireCrmActor } from '../../../../lib/crm-actor.server';
import { getCrmCopy, parseCrmFeedback } from '../../../../lib/crm-localization';
import { getCrmSectionsCopy } from '../../../../lib/crm-sections-localization';
import { getEnquiryTimingPreferenceLabel } from '../../../../lib/enquiry-desk-localization';
import { getAdminRequestLocale } from '../../../../lib/request-locale';
import { quickAddLeadAction } from '../../sections/actions';

type QuickAddPageProps = {
  searchParams?: Promise<{ error?: string | string[] | undefined }>;
};

const timings = ['SOON', 'WITHIN_MONTH', 'LATER', 'NOT_SURE'] as const;

export default async function QuickAddLeadPage({
  searchParams,
}: QuickAddPageProps) {
  const { user, actor } = await requireCrmActor();
  if (!actor.canWorkEnquiries) notFound();
  const locale = await getAdminRequestLocale();
  const copy = getCrmSectionsCopy(locale);
  const crmCopy = getCrmCopy(locale);
  const feedback = parseCrmFeedback(
    (searchParams ? await searchParams : {}).error,
  );

  return (
    <CrmShell locale={locale} user={user} current="pipeline">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{crmCopy.eyebrow}</p>
          <h1>{copy.quickAddTitle}</h1>
          <p>{copy.quickAddIntro}</p>
        </div>
        <div className={styles.actions}>
          <Link href={localizeHref(locale, '/crm/pipeline')}>
            {copy.board.cancel}
          </Link>
        </div>
      </section>

      {feedback ? (
        <p className={styles.warning} role="alert">
          {crmCopy.feedback[feedback]}
        </p>
      ) : null}

      <section className="admin-panel">
        <form action={quickAddLeadAction} className={styles.form}>
          <label className={styles.field}>
            <span>{copy.quickName}</span>
            <input
              type="text"
              name="name"
              minLength={2}
              maxLength={100}
              required
              autoComplete="off"
              dir="auto"
            />
          </label>
          <label className={styles.field}>
            <span>{copy.quickPhone}</span>
            <input
              type="tel"
              name="phone"
              maxLength={24}
              autoComplete="off"
              dir="ltr"
            />
          </label>
          <label className={styles.field}>
            <span>{copy.quickEmail}</span>
            <input
              type="email"
              name="email"
              maxLength={254}
              autoComplete="off"
              dir="ltr"
            />
          </label>
          <label className={styles.field}>
            <span>{copy.quickSource}</span>
            <select name="source" required defaultValue="walk-in">
              {crmQuickLeadSources.map((source) => (
                <option key={source} value={source}>
                  {copy.quickSourceLabel[source]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{copy.quickSchool}</span>
            <select name="school" required defaultValue="PSYCHOLOGY">
              {enquirySchoolSchema.options.map((school) => (
                <option key={school} value={school}>
                  {getAdminEnumLabel(locale, school)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{copy.quickTiming}</span>
            <select name="timingPreference" defaultValue="">
              <option value="">{copy.quickTimingUnknown}</option>
              {timings.map((timing) => (
                <option key={timing} value={timing}>
                  {getEnquiryTimingPreferenceLabel(locale, timing)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{copy.quickNote}</span>
            <textarea name="note" maxLength={1000} rows={3} dir="auto" />
            <small>{copy.quickNoteHint}</small>
          </label>
          <fieldset className={styles.field}>
            <legend>{copy.quickConsent}</legend>
            <label className={styles.checkbox}>
              <input type="radio" name="consent" value="yes" required />
              <span>{copy.quickConsentYes}</span>
            </label>
            <label className={styles.checkbox}>
              <input type="radio" name="consent" value="no" />
              <span>{copy.quickConsentNo}</span>
            </label>
            <small>{copy.quickConsentHint}</small>
          </fieldset>
          <button type="submit" className={styles.button}>
            {copy.quickSave}
          </button>
        </form>
      </section>
    </CrmShell>
  );
}
