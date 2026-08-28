'use client';

import type { Locale } from '@luminol/localization';
import { Button } from '@luminol/ui';
import { useState, type FormEvent } from 'react';

import { getEnquiryQualificationCopy } from '../lib/enquiry-qualification-localization';
import type { PublicEnquirySchool } from '../lib/programme-enquiry';
import type { getPublicCopy } from '../lib/public-localization';

type FormCopy = ReturnType<typeof getPublicCopy>['form'];
type ContactPreference = '' | 'EMAIL' | 'PHONE' | 'WHATSAPP';

type SubmissionState =
  | { status: 'idle'; message: '' }
  | { status: 'submitting'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

type EnquiryFormProps = {
  locale: Locale;
  copy: FormCopy;
  initialSchool?: PublicEnquirySchool | undefined;
  initialMessage?: string | undefined;
};

export function EnquiryForm({
  locale,
  copy,
  initialSchool = 'GENERAL',
  initialMessage = '',
}: EnquiryFormProps) {
  const qualification = getEnquiryQualificationCopy(locale);
  const [preferredContact, setPreferredContact] =
    useState<ContactPreference>('');
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
    message: '',
  });
  const isSubmitting = submission.status === 'submitting';
  const requiresPhone =
    preferredContact === 'PHONE' || preferredContact === 'WHATSAPP';

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmission({ status: 'submitting', message: copy.sending });

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          city: formData.get('city'),
          preferredContact: formData.get('preferredContact'),
          deliveryPreference: formData.get('deliveryPreference'),
          timingPreference: formData.get('timingPreference'),
          school: formData.get('school'),
          message: formData.get('message'),
          locale,
          consent: formData.get('consent') === 'on',
          website: formData.get('website'),
        }),
      });

      const payload = (await response.json()) as { submitted?: boolean };
      if (!response.ok || !payload.submitted) throw new Error(copy.error);

      form.reset();
      setPreferredContact('');
      setSubmission({ status: 'success', message: copy.success });
    } catch {
      setSubmission({ status: 'error', message: copy.error });
    }
  }

  return (
    <form
      className="enquiry-form"
      aria-busy={isSubmitting}
      aria-labelledby="enquiry-form-title"
      onSubmit={submitEnquiry}
    >
      <div className="form-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="enquiry-form-title">{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>

      <div className="form-grid">
        <label>
          <span>{copy.fullName}</span>
          <input
            autoComplete="name"
            maxLength={100}
            minLength={2}
            name="name"
            required
            type="text"
          />
        </label>
        <label>
          <span>{copy.email}</span>
          <input
            autoComplete="email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </label>
        <label>
          <span>{qualification.city}</span>
          <input
            autoComplete="address-level2"
            maxLength={120}
            minLength={2}
            name="city"
            required
            type="text"
          />
        </label>
        <label>
          <span>{qualification.preferredContact}</span>
          <select
            defaultValue=""
            name="preferredContact"
            onChange={(event) =>
              setPreferredContact(
                event.currentTarget.value as ContactPreference,
              )
            }
            required
          >
            <option value="" disabled>
              {qualification.chooseContact}
            </option>
            <option value="EMAIL">{qualification.contactEmail}</option>
            <option value="PHONE">{qualification.contactPhone}</option>
            <option value="WHATSAPP">{qualification.contactWhatsapp}</option>
          </select>
        </label>
        <label>
          <span>
            {copy.phone}{' '}
            {!requiresPhone ? <small>{copy.optional}</small> : null}
          </span>
          <input
            autoComplete="tel"
            maxLength={30}
            name="phone"
            required={requiresPhone}
            type="tel"
          />
          <small>{qualification.phoneHint}</small>
        </label>
        <label>
          <span>{qualification.deliveryPreference}</span>
          <select defaultValue="" name="deliveryPreference" required>
            <option value="" disabled>
              {qualification.chooseDelivery}
            </option>
            <option value="IN_PERSON">{qualification.inPerson}</option>
            <option value="ONLINE">{qualification.online}</option>
            <option value="FLEXIBLE">{qualification.flexible}</option>
            <option value="NOT_SURE">{qualification.notSure}</option>
          </select>
        </label>
        <label>
          <span>{qualification.timingPreference}</span>
          <select defaultValue="" name="timingPreference" required>
            <option value="" disabled>
              {qualification.chooseTiming}
            </option>
            <option value="SOON">{qualification.soon}</option>
            <option value="WITHIN_MONTH">{qualification.withinMonth}</option>
            <option value="LATER">{qualification.later}</option>
            <option value="NOT_SURE">{qualification.notSure}</option>
          </select>
        </label>
        <label>
          <span>{copy.interest}</span>
          <select defaultValue={initialSchool} name="school" required>
            <option value="GENERAL">{copy.choose}</option>
            <option value="PSYCHOLOGY">{copy.psychology}</option>
            <option value="LANGUAGES">{copy.languages}</option>
            <option value="TRAINING">{copy.training}</option>
          </select>
        </label>
        <label className="message-field">
          <span>{copy.message}</span>
          <textarea
            defaultValue={initialMessage}
            maxLength={2000}
            minLength={10}
            name="message"
            required
            rows={7}
          />
        </label>
      </div>

      <label className="honeypot" aria-hidden="true">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} type="text" />
      </label>

      <label className="consent-field">
        <input name="consent" required type="checkbox" />
        <span>{copy.consent}</span>
      </label>

      <div className="form-actions">
        <Button disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? copy.sending : copy.submit}
        </Button>
        <p
          className={`form-status form-status-${submission.status}`}
          role="status"
          aria-atomic="true"
          aria-live="polite"
        >
          {submission.message}
        </p>
      </div>
    </form>
  );
}
