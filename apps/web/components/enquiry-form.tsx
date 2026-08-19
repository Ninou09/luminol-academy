'use client';

import type { Locale } from '@luminol/localization';
import { useState, type FormEvent } from 'react';
import { Button } from '@luminol/ui';

import type { getPublicCopy } from '../lib/public-localization';

type FormCopy = ReturnType<typeof getPublicCopy>['form'];

type SubmissionState =
  | { status: 'idle'; message: '' }
  | { status: 'submitting'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

type EnquiryFormProps = {
  locale: Locale;
  copy: FormCopy;
};

export function EnquiryForm({ locale, copy }: EnquiryFormProps) {
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
    message: '',
  });
  const isSubmitting = submission.status === 'submitting';

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
          <span>
            {copy.phone} <small>{copy.optional}</small>
          </span>
          <input autoComplete="tel" maxLength={30} name="phone" type="tel" />
        </label>
        <label>
          <span>{copy.interest}</span>
          <select defaultValue="GENERAL" name="school" required>
            <option value="GENERAL">{copy.choose}</option>
            <option value="PSYCHOLOGY">{copy.psychology}</option>
            <option value="LANGUAGES">{copy.languages}</option>
            <option value="TRAINING">{copy.training}</option>
          </select>
        </label>
        <label className="message-field">
          <span>{copy.message}</span>
          <textarea
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
