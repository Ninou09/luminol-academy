'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { setCalmMode, useCalmMode } from '../lib/calm-mode';
import type { Locale } from '@luminol/localization';

import { AccessibilityMenu } from './accessibility-menu';
import { AssistantChat } from './assistant-chat';
import styles from './site-dock.module.css';

const toolsLabel = {
  en: 'Display settings',
  fr: 'Réglages d’affichage',
  ar: 'إعدادات العرض',
} as const satisfies Record<Locale, string>;

/**
 * Floating dock: a WhatsApp shortcut (only when Luminol has configured a
 * number) and a back-to-top button whose ring fills with scroll progress.
 * It also gives every route change a soft fade-in so pages feel connected.
 */
export function SiteDock({
  whatsappHref,
  whatsappLabel,
  topLabel,
  calmLabels,
  a11yLabels,
  locale,
  assistantEnabled,
}: {
  locale: Locale;
  assistantEnabled: boolean;
  whatsappHref: string | null;
  whatsappLabel: string;
  topLabel: string;
  calmLabels: { on: string; off: string };
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
  const ringRef = useRef<SVGCircleElement>(null);
  const [visible, setVisible] = useState(false);
  // Phones: display settings (text size, contrast, calm mode) fold behind one button.
  const [toolsOpen, setToolsOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setVisible(window.scrollY > window.innerHeight * 0.8);
      ringRef.current?.style.setProperty('--progress', progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

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
      <button
        type="button"
        className={styles.toolsToggle}
        aria-expanded={toolsOpen}
        aria-controls="dock-tools"
        aria-label={toolsLabel[locale]}
        title={toolsLabel[locale]}
        onClick={() => setToolsOpen((open) => !open)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            d="M4 7h10M18 7h2M4 17h4M12 17h8M16 4.5v5M10 14.5v5"
          />
        </svg>
      </button>
      <div
        id="dock-tools"
        className={styles.tools}
        data-open={toolsOpen || undefined}
      >
        <AccessibilityMenu labels={a11yLabels} />
        <button
          type="button"
          className={styles.calm}
          aria-pressed={calm}
          aria-label={calm ? calmLabels.off : calmLabels.on}
          title={calm ? calmLabels.off : calmLabels.on}
          onClick={() => setCalmMode(!calm)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {calm ? (
              <path
                fill="currentColor"
                d="M12 2l1.8 5.6H20l-5 3.6 1.9 5.8L12 13.4 7.1 17l1.9-5.8-5-3.6h6.2Z"
              />
            ) : (
              <path
                fill="currentColor"
                d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
              />
            )}
          </svg>
        </button>
      </div>
      <button
        type="button"
        className={styles.top}
        data-visible={visible || undefined}
        aria-label={topLabel}
        tabIndex={visible ? 0 : -1}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches
              ? 'auto'
              : 'smooth',
          })
        }
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle className={styles.track} cx="24" cy="24" r="21" />
          <circle
            ref={ringRef}
            className={styles.ring}
            cx="24"
            cy="24"
            r="21"
          />
        </svg>
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
}
