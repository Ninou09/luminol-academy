import {
  crmActivityDirections,
  crmActivityOutcomes,
  crmActivityTypes,
} from '@luminol/validation/crm-activities';

import { logCrmActivityAction } from '../app/crm/actions';
import type { CrmCopy } from '../lib/crm-localization';
import styles from './operations.module.css';

type CrmActivityFormProps = {
  copy: CrmCopy;
  subject: { enquiryId: string } | { clientId: string };
  contactConsent: boolean;
  returnTo: string;
  todayIso: string;
};

export function CrmActivityForm({
  copy,
  subject,
  contactConsent,
  returnTo,
  todayIso,
}: CrmActivityFormProps) {
  const [subjectField, subjectId] =
    'enquiryId' in subject
      ? (['enquiryId', subject.enquiryId] as const)
      : (['clientId', subject.clientId] as const);

  return (
    <form action={logCrmActivityAction} className={styles.form}>
      <input type="hidden" name={subjectField} value={subjectId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <p className={contactConsent ? styles.note : styles.warning}>
        {contactConsent ? copy.consentHint : copy.consentNo}
      </p>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>{copy.activityType}</span>
          <select name="type" defaultValue="CALL">
            {crmActivityTypes.map((type) => (
              <option key={type} value={type}>
                {copy.activityTypeLabel[type]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>{copy.direction}</span>
          <select
            name="direction"
            defaultValue={contactConsent ? 'OUTBOUND' : 'INBOUND'}
          >
            {crmActivityDirections.map((direction) => (
              <option key={direction} value={direction}>
                {copy.directionLabel[direction]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>{copy.activityOutcome}</span>
          <select name="outcome" defaultValue="">
            <option value="">—</option>
            {crmActivityOutcomes.map((outcome) => (
              <option key={outcome} value={outcome}>
                {copy.outcomeLabel[outcome]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>{copy.occurredOn}</span>
          <input
            type="date"
            name="occurredOn"
            defaultValue={todayIso}
            max={todayIso}
          />
        </label>
        <label className={`${styles.field} ${styles.wide}`}>
          <span>{copy.summary}</span>
          <textarea
            name="summary"
            rows={3}
            minLength={2}
            maxLength={1000}
            placeholder={copy.summaryHint}
            required
          />
        </label>
      </div>
      <div>
        <button type="submit" className={styles.button}>
          {copy.log}
        </button>
      </div>
    </form>
  );
}
