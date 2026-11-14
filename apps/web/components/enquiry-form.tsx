'use client';

import { localizeHref, type Locale } from '@luminol/localization';
import { Button } from '@luminol/ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import {
  getCurrentEnquiryAttribution,
  getSameOriginReferrerPath,
} from '../lib/enquiry-attribution';
import { getEnquiryQualificationCopy } from '../lib/enquiry-qualification-localization';
import {
  getProgrammeSlugFromPathname,
  type PublicEnquirySchool,
} from '../lib/programme-enquiry';
import { privacyPolicy } from '../lib/privacy-policy';
import type { getPublicCopy } from '../lib/public-localization';

type FormCopy = ReturnType<typeof getPublicCopy>['form'];
type ContactPreference = 'EMAIL' | 'PHONE' | 'WHATSAPP';

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
  /** The surrounding section already has its own heading. */
  embedded?: boolean;
  initialProgrammeSlug?: string | undefined;
};

type WindowWithExtras = Window & {
  va?: (event: 'event', payload: { name: string }) => void;
  turnstile?: { reset: () => void };
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

export function EnquiryForm({
  locale,
  copy,
  initialSchool = 'GENERAL',
  initialMessage = '',
  embedded = false,
  initialProgrammeSlug,
}: EnquiryFormProps) {
  const qualification = getEnquiryQualificationCopy(locale);
  const [preferredContact, setPreferredContact] =
    useState<ContactPreference>('WHATSAPP');
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
    message: '',
  });
  const submissionLock = useRef(false);

  // Load the Cloudflare bot check only when Luminol has configured it.
  useEffect(() => {
    if (!turnstileSiteKey) return;
    if (document.querySelector('script[data-turnstile]')) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    document.head.append(script);
  }, []);
  const isSubmitting = submission.status === 'submitting';
  const requiresEmail = preferredContact === 'EMAIL';

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLock.current) return;
    submissionLock.current = true;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const referrerPathname = getSameOriginReferrerPath(
      document.referrer,
      window.location.origin,
    );
    const attribution = getCurrentEnquiryAttribution({
      pathname: window.location.pathname,
      search: window.location.search,
      referrerPathname,
    });
    const referredProgrammeSlug = referrerPathname
      ? getProgrammeSlugFromPathname(referrerPathname)
      : null;
    const programmeSlug =
      initialProgrammeSlug ?? referredProgrammeSlug ?? undefined;

    setSubmission({ status: 'submitting', message: copy.sending });
    const turnstileToken = formData.get('cf-turnstile-response');

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(typeof turnstileToken === 'string' && turnstileToken
            ? { 'x-turnstile-token': turnstileToken }
            : {}),
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email') ?? '',
          phone: formData.get('phone') ?? '',
          city: formData.get('city'),
          preferredContact: formData.get('preferredContact'),
          deliveryPreference: formData.get('deliveryPreference') || undefined,
          timingPreference: formData.get('timingPreference') || undefined,
          school: formData.get('school'),
          programmeSlug,
          ...attribution,
          message: formData.get('message') ?? '',
          locale,
          consent: formData.get('consent') === 'on',
          website: formData.get('website'),
        }),
      });

      const payload = (await response.json()) as { submitted?: boolean };
      if (!response.ok || !payload.submitted) throw new Error(copy.error);

      form.reset();
      (window as WindowWithExtras).va?.('event', { name: 'Enquiry submitted' });
      setPreferredContact('WHATSAPP');
      setSubmission({ status: 'success', message: copy.success });
    } catch {
      setSubmission({ status: 'error', message: copy.error });
    } finally {
      (window as WindowWithExtras).turnstile?.reset();
      submissionLock.current = false;
    }
  }

  return (
    <form
      className={
        embedded ? 'enquiry-form enquiry-form--embedded' : 'enquiry-form'
      }
      aria-busy={isSubmitting}
      aria-labelledby="enquiry-form-title"
      onSubmit={submitEnquiry}
    >
      <div className="form-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="enquiry-form-title">{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>

      {initialMessage ? (
        <p className="enquiry-context">{initialMessage}</p>
      ) : null}

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
          <span>{qualification.preferredContact}</span>
          <select
            value={preferredContact}
            name="preferredContact"
            onChange={(event) =>
              setPreferredContact(
                event.currentTarget.value as ContactPreference,
              )
            }
            required
          >
            <option value="WHATSAPP">{qualification.contactWhatsapp}</option>
            <option value="PHONE">{qualification.contactPhone}</option>
            <option value="EMAIL">{qualification.contactEmail}</option>
          </select>
        </label>
        {requiresEmail ? (
          <label>
            <span>{copy.email}</span>
            <input
              key="email"
              autoComplete="email"
              dir="ltr"
              maxLength={254}
              name="email"
              required
              type="email"
            />
          </label>
        ) : (
          <label>
            <span>{copy.phone}</span>
            <input
              key="phone"
              autoComplete="tel"
              dir="ltr"
              maxLength={30}
              name="phone"
              required
              type="tel"
            />
            <small>{qualification.phoneHint}</small>
          </label>
        )}
        <label>
          <span>{copy.interest}</span>
          <select defaultValue={initialSchool} name="school" required>
            <option value="GENERAL">{copy.choose}</option>
            <option value="PSYCHOLOGY">{copy.psychology}</option>
            <option value="LANGUAGES">{copy.languages}</option>
            <option value="TRAINING">{copy.training}</option>
          </select>
        </label>
      </div>

      <details
        className="enquiry-details"
        onInvalidCapture={(event) => {
          event.currentTarget.open = true;
        }}
      >
        <summary>{qualification.optionalDetails}</summary>
        <p>{qualification.optionalDetailsHint}</p>
        <div className="form-grid">
          <label className="message-field">
            <span>
              {copy.message} <small>{copy.optional}</small>
            </span>
            <textarea
              defaultValue={initialMessage}
              maxLength={2000}
              name="message"
              rows={3}
            />
          </label>
          <label>
            <span>
              {qualification.city} <small>{copy.optional}</small>
            </span>
            <input
              autoComplete="address-level2"
              maxLength={120}
              name="city"
              type="text"
            />
          </label>
          <label>
            <span>
              {qualification.deliveryPreference} <small>{copy.optional}</small>
            </span>
            <select defaultValue="" name="deliveryPreference">
              <option value="">{qualification.chooseDelivery}</option>
              <option value="IN_PERSON">{qualification.inPerson}</option>
              <option value="ONLINE">{qualification.online}</option>
              <option value="FLEXIBLE">{qualification.flexible}</option>
              <option value="NOT_SURE">{qualification.notSure}</option>
            </select>
          </label>
          <label>
            <span>
              {qualification.timingPreference} <small>{copy.optional}</small>
            </span>
            <select defaultValue="" name="timingPreference">
              <option value="">{qualification.chooseTiming}</option>
              <option value="SOON">{qualification.soon}</option>
              <option value="WITHIN_MONTH">{qualification.withinMonth}</option>
              <option value="LATER">{qualification.later}</option>
              <option value="NOT_SURE">{qualification.notSure}</option>
            </select>
          </label>
        </div>
      </details>

      <label className="honeypot" aria-hidden="true">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} type="text" />
      </label>

      {turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSiteKey}
          data-theme="dark"
          data-language={locale}
        />
      ) : null}

      <label className="consent-field">
        <input name="consent" required type="checkbox" />
        <span>
          {copy.consent}{' '}
          <a href={localizeHref(locale, '/privacy')} target="_blank" rel="noopener">
            {privacyPolicy[locale].linkLabel}
          </a>
        </span>
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
