'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@luminol/ui';

type SubmissionState =
  | { status: 'idle'; message: '' }
  | { status: 'submitting'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export function EnquiryForm() {
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
    message: '',
  });

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmission({
      status: 'submitting',
      message: 'Sending your enquiry…',
    });

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
          locale: 'en',
          consent: formData.get('consent') === 'on',
          website: formData.get('website'),
        }),
      });

      const payload = (await response.json()) as {
        submitted?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.submitted) {
        throw new Error(payload.error || 'Unable to submit the enquiry.');
      }

      form.reset();
      setSubmission({
        status: 'success',
        message:
          'Thank you. Your enquiry is safely with Luminol, and the team will review it.',
      });
    } catch (error) {
      setSubmission({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to submit the enquiry. Please try again.',
      });
    }
  }

  return (
    <form className="enquiry-form" onSubmit={submitEnquiry}>
      <div className="form-heading">
        <p className="eyebrow">Tell us about your goal</p>
        <h2>Start your Luminol journey.</h2>
        <p>
          Share what you are looking for. The Luminol team will use these
          details only to understand and respond to your enquiry.
        </p>
      </div>

      <div className="form-grid">
        <label>
          <span>Full name</span>
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
          <span>Email address</span>
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
            Phone number <small>Optional</small>
          </span>
          <input autoComplete="tel" maxLength={30} name="phone" type="tel" />
        </label>
        <label>
          <span>Area of interest</span>
          <select defaultValue="GENERAL" name="school" required>
            <option value="GENERAL">Help me choose</option>
            <option value="PSYCHOLOGY">Psychology</option>
            <option value="LANGUAGES">Languages</option>
            <option value="TRAINING">Professional Training</option>
          </select>
        </label>
        <label className="message-field">
          <span>How can Luminol help?</span>
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
        <span>
          I agree that Luminol may store and use these details to respond to my
          enquiry.
        </span>
      </label>

      <div className="form-actions">
        <Button
          disabled={submission.status === 'submitting'}
          size="lg"
          type="submit"
        >
          {submission.status === 'submitting' ? 'Sending…' : 'Send my enquiry'}
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
