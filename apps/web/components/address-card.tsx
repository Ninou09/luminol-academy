import type { Locale } from '@luminol/localization';

import { addressCopy, officialAddress } from '../lib/contact-channels';
import { LiveMap } from './live-map';
import styles from './address-card.module.css';

/**
 * The academy's address beside an interactive Google map with in-page route
 * planning. The privacy policy explains that the map is served by Google.
 */
export function AddressCard({ locale }: { locale: Locale }) {
  const copy = addressCopy[locale];
  return (
    <div className={styles.card}>
      <LiveMap
        latitude={officialAddress.latitude}
        longitude={officialAddress.longitude}
        language={locale}
        copy={copy.map}
      />
      <div className={styles.body}>
        <p className={styles.eyebrow}>{copy.visit}</p>
        <h3>{copy.title}</h3>
        <address>
          Luminol Academy
          <br />
          {officialAddress.street[locale]}
          <br />
          {officialAddress.city[locale]}, {officialAddress.country[locale]}
        </address>
        <div className={styles.actions}>
          <a
            className={styles.primary}
            href={officialAddress.directionsHref}
            target="_blank"
            rel="noopener"
          >
            {copy.directions} <span aria-hidden="true">↗</span>
          </a>
          <a href={officialAddress.mapHref} target="_blank" rel="noopener">
            {copy.open}
          </a>
        </div>
      </div>
    </div>
  );
}
