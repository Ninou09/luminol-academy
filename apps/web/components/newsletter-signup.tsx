'use client';

import type { Locale } from '@luminol/localization';
import { useState, type FormEvent } from 'react';

import styles from './newsletter-signup.module.css';

const copy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    body: string;
    name: string;
    email: string;
    interest: string;
    interests: Record<
      'GENERAL' | 'PSYCHOLOGY' | 'LANGUAGES' | 'TRAINING',
      string
    >;
    consent: string;
    privacy: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  }
> = {
  en: {
    eyebrow: 'Newsletter',
    title: 'New sessions, straight to your inbox.',
    body: 'Free awareness sessions, programme openings and academy news. Unsubscribe any time.',
    name: 'Your name',
    email: 'Email address',
    interest: 'Most interested in',
    interests: {
      GENERAL: 'Everything',
      PSYCHOLOGY: 'Psychology',
      LANGUAGES: 'Languages',
      TRAINING: 'Professional training',
    },
    consent: 'I agree to receive Luminol news by email.',
    privacy: 'Privacy policy',
    submit: 'Subscribe',
    sending: 'Subscribing…',
    success: 'Thank you — you are on the list.',
    error: 'Something went wrong. Please try again.',
  },
  fr: {
    eyebrow: 'Newsletter',
    title: 'Les nouvelles séances, directement dans votre boîte.',
    body: 'Séances de sensibilisation gratuites, ouvertures de programmes et actualités de l’académie. Désinscription à tout moment.',
    name: 'Votre nom',
    email: 'Adresse e-mail',
    interest: 'Vous intéresse surtout',
    interests: {
      GENERAL: 'Tout',
      PSYCHOLOGY: 'Psychologie',
      LANGUAGES: 'Langues',
      TRAINING: 'Formation professionnelle',
    },
    consent: 'J’accepte de recevoir les actualités de Luminol par e-mail.',
    privacy: 'Politique de confidentialité',
    submit: 'S’abonner',
    sending: 'Inscription…',
    success: 'Merci — vous êtes inscrit(e).',
    error: 'Une erreur est survenue. Veuillez réessayer.',
  },
  ar: {
    eyebrow: 'النشرة البريدية',
    title: 'اللقاءات الجديدة تصلك مباشرة.',
    body: 'لقاءات توعوية مجانية، وافتتاح البرامج، وأخبار الأكاديمية. يمكنك إلغاء الاشتراك في أي وقت.',
    name: 'اسمك',
    email: 'البريد الإلكتروني',
    interest: 'أكثر ما يهمك',
    interests: {
      GENERAL: 'كل شيء',
      PSYCHOLOGY: 'علم النفس',
      LANGUAGES: 'اللغات',
      TRAINING: 'التدريب المهني',
    },
    consent: 'أوافق على تلقي أخبار لومينول عبر البريد الإلكتروني.',
    privacy: 'سياسة الخصوصية',
    submit: 'اشترك',
    sending: 'جارٍ الاشتراك…',
    success: 'شكرًا، تم تسجيلك في القائمة.',
    error: 'حدث خطأ، يُرجى المحاولة مرة أخرى.',
  },
};

/** A compact, consent-first newsletter sign-up. */
export function NewsletterSignup({
  locale,
  privacyHref,
}: {
  locale: Locale;
  privacyHref: string;
}) {
  const text = copy[locale];
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>(
    'idle',
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'sending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setState('sending');
    try {
      const token = data.get('cf-turnstile-response');
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(typeof token === 'string' && token
            ? { 'x-turnstile-token': token }
            : {}),
        },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          interest: data.get('interest'),
          locale,
          consent: data.get('consent') === 'on',
          website: data.get('website') ?? '',
        }),
      });
      if (!response.ok) throw new Error('failed');
      form.reset();
      setState('success');
    } catch {
      setState('error');
    }
  }

  return (
    <section className={styles.band} aria-labelledby="newsletter-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h2 id="newsletter-title" data-no-split>
          {text.title}
        </h2>
        <p>{text.body}</p>
      </div>
      <form
        className={styles.form}
        onSubmit={submit}
        aria-busy={state === 'sending'}
      >
        <label>
          <span>{text.name}</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
          />
        </label>
        <label>
          <span>{text.email}</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            inputMode="email"
            dir="ltr"
          />
        </label>
        <label>
          <span>{text.interest}</span>
          <select name="interest" defaultValue="GENERAL">
            {Object.entries(text.interests).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.honeypot} aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label className={styles.consent}>
          <input name="consent" type="checkbox" required />
          <span>
            {text.consent}{' '}
            <a href={privacyHref} target="_blank" rel="noopener">
              {text.privacy}
            </a>
          </span>
        </label>
        <button type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? text.sending : text.submit}
        </button>
        <p
          className={styles.status}
          role="status"
          aria-live="polite"
          data-state={state}
        >
          {state === 'success'
            ? text.success
            : state === 'error'
              ? text.error
              : ''}
        </p>
      </form>
    </section>
  );
}
