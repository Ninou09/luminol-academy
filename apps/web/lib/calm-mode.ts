'use client';

import { useSyncExternalStore } from 'react';

const key = 'luminol-calm-mode';
const change = 'luminol:calm-mode';
let manual: boolean | undefined;
const serverSnapshot = () => false;

function readCalmMode() {
  if (manual !== undefined) return manual;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function connection() {
  return (
    navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean };
    }
  ).connection;
}

function subscribe(notify: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const network = connection();
  const syncStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      manual = undefined;
      notify();
    }
  };
  window.addEventListener(change, notify);
  window.addEventListener('storage', syncStorage);
  document.addEventListener('visibilitychange', notify);
  media.addEventListener('change', notify);
  network?.addEventListener('change', notify);
  return () => {
    window.removeEventListener(change, notify);
    window.removeEventListener('storage', syncStorage);
    document.removeEventListener('visibilitychange', notify);
    media.removeEventListener('change', notify);
    network?.removeEventListener('change', notify);
  };
}

export function setCalmMode(value: boolean) {
  manual = value;
  try {
    if (value) window.localStorage.setItem(key, '1');
    else window.localStorage.removeItem(key);
  } catch {
    /* The in-memory setting still applies. */
  }
  window.dispatchEvent(new Event(change));
}

export function useCalmMode() {
  return useSyncExternalStore(subscribe, readCalmMode, serverSnapshot);
}

export function motionAllowed() {
  return (
    !document.hidden &&
    !readCalmMode() &&
    !connection()?.saveData &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function useMotionAllowed() {
  return useSyncExternalStore(subscribe, motionAllowed, serverSnapshot);
}
