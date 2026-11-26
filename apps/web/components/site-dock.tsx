'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { setCalmMode, useCalmMode } from '../lib/calm-mode';
import type { Locale } from '@luminol/localization';

import { AccessibilityMenu } from './accessibility-menu';
import { AssistantChat } from './assistant-chat';
import styles from './site-dock.module.css';

export function SiteDock({
  whatsappHref,
  whatsappLabel,
  topLabel,
  calmLabel,
  a11yLabels,
  locale,
  assistantEnabled,
}: {
  locale: Locale;
  assistantEnabled: boolean;
  whatsappHref: string | null;
  whatsappLabel: string;
  topLabel: string;
  calmLabel: string;
  a11yLabels: {
    button: string;
    title: string;
    largeText: string;
    highContrast: string;
    close: string;
  };
}) {
  const calm = useCalmMode();
  const pathname = usePathname();
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dock = dockRef.current;
    const section = document.querySelector(
      '#consultation-enquiry, #contact-form, #top',
    );
    if (!dock || !section) return;
    const observer = new IntersectionObserver(([entry]) => {
      const visible = Boolean(entry?.isIntersecting);
      if (section.id === 'top') dock.toggleAttribute('data-at-hero', visible);
      else dock.hidden = visible;
    });
    observer.observe(section);
    return () => {
      observer.disconnect();
      dock.hidden = false;
      dock.removeAttribute('data-at-hero');
    };
  }, [pathname]);

  return (
    <div ref={dockRef} className={styles.dock}>
      {whatsappHref ? (
        <a
          className={styles.whatsapp}
          href={whatsappHref}
          target="_blank"
          rel="noopener"
          aria-label={whatsappLabel}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z"
            />
          </svg>
        </a>
      ) : null}
      {assistantEnabled ? (
        <AssistantChat locale={locale} whatsappHref={whatsappHref} />
      ) : null}
      <AccessibilityMenu
        labels={a11yLabels}
        calm={calm}
        calmLabel={calmLabel}
        onCalmChange={() => setCalmMode(!calm)}
        topLabel={topLabel}
        onTop={() =>
          window.scrollTo({
            top: 0,
            behavior:
              calm ||
              window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
          })
        }
      />
    </div>
  );
}
