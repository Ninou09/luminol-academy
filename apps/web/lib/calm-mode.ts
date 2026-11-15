'use client';

import { useEffect, useState } from 'react';

/**
 * "Calm mode": the visitor can switch off the animated 3D universe. The
 * choice is a per-browser convenience kept in localStorage.
 */
const KEY = 'luminol-calm-mode';
const EVENT = 'luminol:calm-mode';

export function readCalmMode(): boolean {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setCalmMode(value: boolean) {
  try {
    if (value) window.localStorage.setItem(KEY, '1');
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage may be unavailable (private mode); the toggle still works now.
  }
  if (value) document.documentElement.dataset.calm = 'true';
  else delete document.documentElement.dataset.calm;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function useCalmMode(): boolean {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const initial = readCalmMode();
    setCalm(initial);
    if (initial) document.documentElement.dataset.calm = 'true';
    const onChange = (event: Event) =>
      setCalm(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  return calm;
}
