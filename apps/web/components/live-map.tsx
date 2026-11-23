'use client';

import { useState } from 'react';

import styles from './address-card.module.css';

type LiveMapCopy = {
  mapTitle: string;
  originLabel: string;
  originPlaceholder: string;
  showRoute: string;
  useLocation: string;
  locating: string;
  locationUnavailable: string;
  reset: string;
};

/**
 * Interactive Google map of the academy. Visitors can pan and zoom, and draw
 * a route from a typed place or from their current location without leaving
 * the page. No API key is needed for this embed.
 */
export function LiveMap({
  latitude,
  longitude,
  language,
  copy,
}: {
  latitude: number;
  longitude: number;
  language: string;
  copy: LiveMapCopy;
}) {
  const destination = `${latitude},${longitude}`;
  const placeSrc = `https://www.google.com/maps?q=${destination}&z=17&hl=${language}&output=embed`;
  const [src, setSrc] = useState(placeSrc);
  const [origin, setOrigin] = useState('');
  const [status, setStatus] = useState<'idle' | 'locating' | 'error'>('idle');

  function routeFrom(start: string) {
    const from = start.trim();
    if (!from) return;
    setSrc(
      `https://www.google.com/maps?saddr=${encodeURIComponent(from)}&daddr=${destination}&hl=${language}&output=embed`,
    );
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('idle');
        routeFrom(
          `${position.coords.latitude.toFixed(5)},${position.coords.longitude.toFixed(5)}`,
        );
      },
      () => setStatus('error'),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  return (
    <div className={styles.liveMap}>
      <iframe
        className={styles.mapFrame}
        title={copy.mapTitle}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <form
        className={styles.routeForm}
        onSubmit={(event) => {
          event.preventDefault();
          routeFrom(origin);
        }}
      >
        <label htmlFor="route-origin">{copy.originLabel}</label>
        <div className={styles.routeRow}>
          <input
            id="route-origin"
            name="origin"
            type="text"
            autoComplete="street-address"
            placeholder={copy.originPlaceholder}
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
          />
          <button type="submit">{copy.showRoute}</button>
        </div>
        <div className={styles.routeRow}>
          <button
            type="button"
            className={styles.ghost}
            onClick={useMyLocation}
            disabled={status === 'locating'}
          >
            {status === 'locating' ? copy.locating : copy.useLocation}
          </button>
          {src !== placeSrc ? (
            <button
              type="button"
              className={styles.ghost}
              onClick={() => {
                setSrc(placeSrc);
                setStatus('idle');
              }}
            >
              {copy.reset}
            </button>
          ) : null}
        </div>
        {status === 'error' ? (
          <p role="status" className={styles.routeError}>
            {copy.locationUnavailable}
          </p>
        ) : null}
      </form>
    </div>
  );
}
