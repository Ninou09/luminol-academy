'use client';

import { localizeHref, type Locale } from '@luminol/localization';
import { Button } from '@luminol/ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import {
  getCurrentEnquiryAttribution,
  getSameOriginReferrerPath,
} from '../lib/enquiry-attribution';
import { getEnquiryQualificationCopy } from '../lib/enquiry-qualification-localization';
import { type PublicEnquirySchool } from '../lib/programme-enquiry';
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
  headingId?: string;
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
  headingId = 'enquiry-form-title',
}: EnquiryFormProps) {
  const qualification = getEnquiryQualificationCopy(locale);
  const [preferredContact, setPreferredContact] =
    useState<ContactPreference>('WHATSAPP');
  const [submission, setSubmission] = useState<SubmissionState>({
    status: 'idle',
    message: '',
  });
  const [contacts, setContacts] = useState({ email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldHints: Record<string, string> = {
    name: {
      ar: 'أدخل اسمًا من حرفين على الأقل.',
      fr: 'Saisissez un nom d’au moins deux caractères.',
      en: 'Enter a name of at least two characters.',
    }[locale],
    phone: qualification.phoneHint,
    email: {
      ar: 'أدخل عنوان بريد إلكتروني صالحًا.',
      fr: 'Saisissez une adresse e-mail valide.',
      en: 'Enter a valid email address.',
    }[locale],
    consent: copy.consent,
  };
  function fieldError(name: string) {
    return errors[name] ? (
      <small id={'error-' + name} role="alert">
        {errors[name]}
      </small>
    ) : null;
  }
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
          school: initialProgrammeSlug ? initialSchool : formData.get('school'),
          programmeSlug: initialProgrammeSlug,
          ...attribution,
          message: formData.get('message') ?? '',
          locale,
          consent: formData.get('consent') === 'on',
          website: formData.get('website'),
        }),
      });

      const payload = (await response.json()) as {
        submitted?: boolean;
        code?: string;
      };
      if (
        payload.code === 'programme_unavailable' ||
        payload.code === 'programme_retired'
      ) {
        const message =
          payload.code === 'programme_retired'
            ? {
                en: 'This course is no longer published. Choose another programme in the catalogue.',
                fr: 'Cette formation n’est plus publiée. Choisissez une autre formation dans le catalogue.',
                ar: 'لم يعد هذا البرنامج منشورًا. اختر برنامجًا آخر من الدليل.',
              }
            : {
                en: 'We could not verify the course. Please submit again.',
                fr: 'Impossible de vérifier la formation. Veuillez réessayer.',
                ar: 'تعذّر التحقق من البرنامج. أعد إرسال الطلب.',
              };
        setSubmission({ status: 'error', message: message[locale] });
        return;
      }
      if (!response.ok || !payload.submitted) throw new Error(copy.error);

      const destination = requiresEmail ? contacts.email : contacts.phone;
      form.reset();
      setErrors({});
      setContacts({ email: '', phone: '' });
      (window as WindowWithExtras).va?.('event', { name: 'Enquiry submitted' });
      setPreferredContact('WHATSAPP');
      setSubmission({
        status: 'success',
        message:
          copy.success +
          ' ' +
          {
            en: 'We will reply via',
            fr: 'Nous vous répondrons via',
            ar: 'سنرد عليك عبر',
          }[locale] +
          ' ' +
          {
            EMAIL: qualification.contactEmail,
            PHONE: qualification.contactPhone,
            WHATSAPP: qualification.contactWhatsapp,
          }[preferredContact] +
          ' · ' +
          destination,
      });
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
      aria-labelledby={headingId}
      onInvalidCapture={(event) => {
        const field = event.target;
        if (field instanceof HTMLInputElement && fieldHints[field.name])
          setErrors((previous) => ({
            ...previous,
            [field.name]: fieldHints[field.name]!,
          }));
      }}
      onInput={(event) => {
        const field = event.target;
        if (
          field instanceof HTMLInputElement &&
          field.validity.valid &&
          errors[field.name]
        )
          setErrors((previous) => ({ ...previous, [field.name]: '' }));
      }}
      onSubmit={submitEnquiry}
    >
      <div className="form-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id={headingId}>{copy.title}</h2>
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
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'error-name' : undefined}
            name="name"
            required
            type="text"
          />
          {fieldError('name')}
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
              value={contacts.email}
              onChange={(event) =>
                setContacts({ ...contacts, email: event.target.value })
              }
              autoComplete="email"
              dir="ltr"
              maxLength={254}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'error-email' : undefined}
              name="email"
              required
              type="email"
            />
            {fieldError('email')}
          </label>
        ) : (
          <label>
            <span>{copy.phone}</span>
            <input
              key="phone"
              value={contacts.phone}
              onChange={(event) =>
                setContacts({ ...contacts, phone: event.target.value })
              }
              autoComplete="tel"
              dir="ltr"
              maxLength={30}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'error-phone' : undefined}
              name="phone"
              required
              type="tel"
            />
            {fieldError('phone')}
            <small>{qualification.phoneHint}</small>
          </label>
        )}
        <label>
          <span>{copy.interest}</span>
          <select
            disabled={Boolean(initialProgrammeSlug)}
            defaultValue={initialSchool}
            name="school"
            required
          >
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
        <input
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? 'error-consent' : undefined}
          name="consent"
          required
          type="checkbox"
        />
        {fieldError('consent')}
        <span>
          {copy.consent}{' '}
          <a
            href={localizeHref(locale, '/privacy')}
            target="_blank"
            rel="noopener"
          >
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
