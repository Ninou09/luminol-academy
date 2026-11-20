'use client';

import type { Locale } from '@luminol/localization';
import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import styles from './assistant-chat.module.css';

type Message = { role: 'user' | 'assistant'; content: string };

const copy: Record<
  Locale,
  {
    open: string;
    close: string;
    title: string;
    subtitle: string;
    consentTitle: string;
    consentBody: string;
    start: string;
    placeholder: string;
    send: string;
    human: string;
    greeting: string;
    suggestions: readonly string[];
    thinking: string;
    error: string;
  }
> = {
  en: {
    open: 'Ask Luminol Assistant',
    close: 'Close the assistant',
    title: 'Luminol Assistant',
    subtitle: 'Automated helper · answers about the academy',
    consentTitle: 'Before we start',
    consentBody:
      'I am an AI helper, not a therapist or a crisis service. I answer questions about Luminol from the website and connect you with the team. Please don’t share sensitive medical, financial or identity details. Your messages are sent to our AI provider to create replies and are not stored by Luminol. In an emergency, contact local emergency services.',
    start: 'I understand — start',
    placeholder: 'Ask about schools, events, hours…',
    send: 'Send',
    human: 'Talk to a person',
    greeting: 'Hello! How can I help you find your way at Luminol today?',
    suggestions: [
      'Which school is right for me?',
      'What events are coming up?',
      'How does a first consultation work?',
      'Where is the academy?',
    ],
    thinking: 'Writing…',
    error: 'Something went wrong. Please try WhatsApp or call reception.',
  },
  fr: {
    open: 'Demander à l’assistant Luminol',
    close: 'Fermer l’assistant',
    title: 'Assistant Luminol',
    subtitle: 'Assistant automatique · questions sur l’académie',
    consentTitle: 'Avant de commencer',
    consentBody:
      'Je suis un assistant IA, pas un thérapeute ni un service d’urgence. Je réponds aux questions sur Luminol à partir du site et je vous mets en contact avec l’équipe. Ne partagez pas d’informations médicales, financières ou d’identité sensibles. Vos messages sont envoyés à notre fournisseur d’IA pour générer les réponses et ne sont pas conservés par Luminol. En cas d’urgence, contactez les services d’urgence locaux.',
    start: 'J’ai compris — commencer',
    placeholder: 'Écoles, événements, horaires…',
    send: 'Envoyer',
    human: 'Parler à une personne',
    greeting: 'Bonjour ! Comment puis-je vous aider à trouver votre chemin chez Luminol ?',
    suggestions: [
      'Quelle école me convient ?',
      'Quels sont les prochains événements ?',
      'Comment se passe une première consultation ?',
      'Où se trouve l’académie ?',
    ],
    thinking: 'Rédaction…',
    error: 'Une erreur est survenue. Essayez WhatsApp ou appelez l’accueil.',
  },
  ar: {
    open: 'اسأل مساعد لومينول',
    close: 'إغلاق المساعد',
    title: 'مساعد لومينول',
    subtitle: 'مساعد آلي · إجابات حول الأكاديمية',
    consentTitle: 'قبل أن نبدأ',
    consentBody:
      'أنا مساعد ذكاء اصطناعي، ولست معالجًا ولا خدمة طوارئ. أجيب عن أسئلة لومينول من محتوى الموقع وأوصلك بالفريق. يُرجى عدم مشاركة معلومات طبية أو مالية أو تعريفية حساسة. تُرسل رسائلك إلى مزوّد الذكاء الاصطناعي لإنشاء الردود ولا تحتفظ بها لومينول. في حالة الطوارئ اتصل بخدمات الطوارئ المحلية.',
    start: 'فهمت، لنبدأ',
    placeholder: 'اسأل عن المدارس أو الفعاليات أو أوقات العمل…',
    send: 'إرسال',
    human: 'تحدّث مع شخص',
    greeting: 'مرحبًا! كيف يمكنني مساعدتك في لومينول اليوم؟',
    suggestions: [
      'أي مدرسة تناسبني؟',
      'ما الفعاليات القادمة؟',
      'كيف تتم الاستشارة الأولى؟',
      'أين تقع الأكاديمية؟',
    ],
    thinking: 'يكتب…',
    error: 'حدث خطأ. جرّب واتساب أو اتصل بالاستقبال.',
  },
};

const CONSENT_KEY = 'luminol-assistant-consent';

/** Floating Luminol Assistant: consent first, streamed answers, human handoff. */
export function AssistantChat({
  locale,
  whatsappHref,
}: {
  locale: Locale;
  whatsappHref: string | null;
}) {
  const text = copy[locale];
  const [open, setOpen] = useState(false);
  const [consented, setConsented] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      setConsented(window.sessionStorage.getItem(CONSENT_KEY) === '1');
    } catch {
      // Storage unavailable: ask again.
    }
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    if (consented) inputRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, consented]);

  function accept() {
    setConsented(true);
    try {
      window.sessionStorage.setItem(CONSENT_KEY, '1');
    } catch {
      // Ignore.
    }
  }

  async function ask(question: string) {
    const content = question.trim();
    if (!content || busy) return;
    const history: Message[] = [...messages, { role: 'user', content }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale, messages: history.slice(-12) }),
      });
      if (!response.body) throw new Error('no body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: 'assistant', content: reply }]);
      }
      if (!reply.trim()) throw new Error('empty');
    } catch {
      setMessages([...history, { role: 'assistant', content: text.error }]);
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.launcher}
        aria-expanded={open}
        aria-controls="luminol-assistant"
        aria-label={open ? text.close : text.open}
        onClick={() => setOpen(!open)}
      >
        <Image src="/media/people/ai-assistant-avatar.webp" alt="" width={56} height={56} />
        <span className={styles.pulse} aria-hidden="true" />
      </button>

      {open ? (
        <section
          id="luminol-assistant"
          className={styles.panel}
          role="dialog"
          aria-label={text.title}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <header className={styles.head}>
            <Image src="/media/people/ai-assistant-avatar.webp" alt="" width={40} height={40} />
            <div>
              <strong>{text.title}</strong>
              <small>{text.subtitle}</small>
            </div>
            <button type="button" className={styles.x} onClick={() => setOpen(false)} aria-label={text.close}>
              ×
            </button>
          </header>

          {!consented ? (
            <div className={styles.consent}>
              <Image
                className={styles.consentArt}
                src="/media/people/assistant-speech-bubble.webp"
                alt=""
                width={1254}
                height={1254}
                sizes="12rem"
              />
              <h2>{text.consentTitle}</h2>
              <p>{text.consentBody}</p>
              <button type="button" className={styles.primary} onClick={accept}>
                {text.start}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.list} ref={listRef} aria-live="polite">
                <p className={`${styles.bubble} ${styles.bot}`}>{text.greeting}</p>
                {messages.map((message, index) => (
                  <p
                    key={index}
                    className={`${styles.bubble} ${message.role === 'user' ? styles.me : styles.bot}`}
                    dir="auto"
                  >
                    {message.content || text.thinking}
                  </p>
                ))}
                {messages.length === 0 ? (
                  <div className={styles.suggestions}>
                    {text.suggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => void ask(suggestion)}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <form className={styles.form} onSubmit={submit}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void ask(input);
                    }
                  }}
                  placeholder={text.placeholder}
                  maxLength={1_200}
                  rows={1}
                  aria-label={text.placeholder}
                  dir="auto"
                />
                <button type="submit" disabled={busy || !input.trim()} className={styles.primary}>
                  {text.send}
                </button>
              </form>
              {whatsappHref ? (
                <a className={styles.human} href={whatsappHref} target="_blank" rel="noopener">
                  {text.human} · WhatsApp ↗
                </a>
              ) : null}
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
