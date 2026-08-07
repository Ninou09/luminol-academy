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
      message: 'جارٍ إرسال استفسارك…',
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
          locale: 'ar',
          consent: formData.get('consent') === 'on',
          website: formData.get('website'),
        }),
      });

      const payload = (await response.json()) as {
        submitted?: boolean;
      };

      if (!response.ok || !payload.submitted) {
        throw new Error('تعذر إرسال الاستفسار الآن. حاول مرة أخرى.');
      }

      form.reset();
      setSubmission({
        status: 'success',
        message: 'شكرًا لك. تم استلام استفسارك وسيقوم فريق لومينول بمراجعته.',
      });
    } catch (error) {
      setSubmission({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'تعذر إرسال الاستفسار الآن. حاول مرة أخرى.',
      });
    }
  }

  return (
    <form className="enquiry-form ar-enquiry-form" onSubmit={submitEnquiry}>
      <div className="form-heading">
        <p className="eyebrow">أخبرنا عن هدفك</p>
        <h2>ابدأ رحلتك مع لومينول.</h2>
        <p>
          شارك معنا ما تبحث عنه. سنستخدم هذه المعلومات فقط لفهم استفسارك
          والتواصل معك بشأنه.
        </p>
      </div>

      <div className="form-grid">
        <label>
          <span>الاسم الكامل</span>
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
          <span>البريد الإلكتروني</span>
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
            رقم الهاتف <small>اختياري</small>
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
          <span>مجال الاهتمام</span>
          <select defaultValue="GENERAL" name="school" required>
            <option value="GENERAL">ساعدني على الاختيار</option>
            <option value="PSYCHOLOGY">علم النفس</option>
            <option value="LANGUAGES">اللغات</option>
            <option value="TRAINING">التكوين المهني</option>
          </select>
        </label>
        <label className="message-field">
          <span>كيف يمكن للومينول مساعدتك؟</span>
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
          أوافق على أن تقوم أكاديمية لومينول بحفظ هذه المعلومات واستخدامها للرد
          على استفساري.
        </span>
      </label>

      <div className="form-actions">
        <Button
          disabled={submission.status === 'submitting'}
          size="lg"
          type="submit"
        >
          {submission.status === 'submitting'
            ? 'جارٍ الإرسال…'
            : 'أرسل استفساري'}
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
