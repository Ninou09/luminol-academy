'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@luminol/ui';
import { formCopy, type PublicLocale } from '../lib/i18n';

type SubmissionState =
  | { status: 'idle'; message: '' }
  | { status: 'submitting'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export function EnquiryForm({ locale = 'ar' }: { locale?: PublicLocale }) {
  const copy = formCopy[locale];
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
    message: '',
  });

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

      if (!response.ok || !payload.submitted) {
        throw new Error(copy.error);
      }

      form.reset();
      setSubmission({ status: 'success', message: copy.success });
    } catch (error) {
      setSubmission({
        status: 'error',
        message: error instanceof Error ? error.message : copy.error,
      });
    }
  }

  return (
    <form className="enquiry-form ar-enquiry-form" onSubmit={submitEnquiry}>
      <div className="form-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>

      <div className="form-grid">
        <label>
          <span>{copy.name}</span>
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
            dir="ltr"
          />
        </label>
        <label>
          <span>
            {copy.phone} <small>{copy.optional}</small>
          </span>
          <input
            autoComplete="tel"
            maxLength={30}
            name="phone"
            type="tel"
            dir="ltr"
          />
        </label>
        <label>
          <span>{copy.school}</span>
          <select defaultValue="GENERAL" name="school" required>
            <option value="GENERAL">{copy.helpChoose}</option>
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
        <Button
          disabled={submission.status === 'submitting'}
          size="lg"
          type="submit"
        >
          {submission.status === 'submitting' ? copy.sending : copy.submit}
        </Button>
        <p
          className={`form-status form-status-${submission.status}`}
          role="status"
          aria-live="polite"
        >
          {submission.message}
        </p>
      </div>
    </form>
  );
}
