'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './accessibility-menu.module.css';

type Prefs = { largeText: boolean; highContrast: boolean };
const KEY = 'luminol-a11y';

function apply(prefs: Prefs) {
  const root = document.documentElement;
  if (prefs.largeText) root.dataset.text = 'large';
  else delete root.dataset.text;
  if (prefs.highContrast) root.dataset.contrast = 'high';
  else delete root.dataset.contrast;
}

/**
 * Reading comfort settings: larger text and high contrast. The choice is a
 * per-browser convenience kept in localStorage.
 */
export function AccessibilityMenu({
  labels,
  calm,
  calmLabel,
  onCalmChange,
  topLabel,
  onTop,
}: {
  calm: boolean;
  calmLabel: string;
  onCalmChange: () => void;
  topLabel: string;
  onTop: () => void;
  labels: {
    button: string;
    title: string;
    largeText: string;
    highContrast: string;
    close: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({
    largeText: false,
    highContrast: false,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(KEY) ?? '{}',
      ) as Partial<Prefs>;
      const next = {
        largeText: Boolean(saved.largeText),
        highContrast: Boolean(saved.highContrast),
      };
      setPrefs(next);
      apply(next);
    } catch {
      // Storage unavailable: defaults stay.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onClick = (event: MouseEvent) => {
      if (!panelRef.current?.parentElement?.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const update = (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    apply(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors.
    }
  };

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        ref={buttonRef}
        className={styles.button}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label={labels.button}
        title={labels.button}
        onClick={() => setOpen(!open)}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path
            d="M10 3h4l.6 2.5 2 .9 2.3-1.3 2.8 2.8-1.3 2.3.9 2 2.5.6v4l-2.5.6-.9 2 1.3 2.3-2.8 2.8-2.3-1.3-2 .9-.6 2.5h-4l-.6-2.5-2-.9-2.3 1.3-2.8-2.8 1.3-2.3-.9-2-2.5-.6v-4l2.5-.6.9-2-1.3-2.3 2.8-2.8 2.3 1.3 2-.9z"
            transform="translate(2 0) scale(.83)"
          />
          <circle cx="12" cy="12" r="3.1" />
        </svg>
      </button>
      {open ? (
        <div
          id="a11y-panel"
          ref={panelRef}
          className={styles.panel}
          role="group"
          aria-label={labels.title}
        >
          <p>{labels.title}</p>
          <label>
            <input
              type="checkbox"
              checked={prefs.largeText}
              onChange={() => update('largeText')}
            />
            <span>{labels.largeText}</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={prefs.highContrast}
              onChange={() => update('highContrast')}
            />
            <span>{labels.highContrast}</span>
          </label>
          <label>
            <input type="checkbox" checked={calm} onChange={onCalmChange} />
            <span>{calmLabel}</span>
          </label>
          <button
            type="button"
            className={styles.close}
            onClick={() => {
              close();
              onTop();
            }}
          >
            {topLabel} <span aria-hidden="true">↑</span>
          </button>
          <button type="button" className={styles.close} onClick={close}>
            {labels.close}
          </button>
        </div>
      ) : null}
    </div>
  );
}
