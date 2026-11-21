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
}: {
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
      if (event.key === 'Escape') setOpen(false);
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
        className={styles.button}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label={labels.button}
        title={labels.button}
        onClick={() => setOpen(!open)}
      >
        Aa
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
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
          >
            {labels.close}
          </button>
        </div>
      ) : null}
    </div>
  );
}
