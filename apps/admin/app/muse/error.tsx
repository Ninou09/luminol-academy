'use client';

import { useEffect, useState } from 'react';
import { parseLocale, type Locale } from '@luminol/localization';
import { getMuseCopy } from '../../lib/muse-copy';
import './muse.css';

export default function MuseError({ reset }: { reset: () => void }) {
  const [locale, setLocale] = useState<Locale>('ar');
  useEffect(() => setLocale(parseLocale(document.documentElement.lang)), []);
  const copy = getMuseCopy(locale);
  return (
    <main className="muse-content">
      <h1>Luminol Muse</h1>
      <p role="alert">{copy.error}</p>
      <button onClick={reset}>{copy.submit}</button>
    </main>
  );
}
