import type { Locale } from '@luminol/localization';

import { addressCopy, officialAddress } from '../lib/contact-channels';
import styles from './address-card.module.css';

/**
 * The academy's address with a drawn, privacy-friendly map: no third-party
 * map loads until the visitor chooses to open Google Maps.
 */
export function AddressCard({ locale }: { locale: Locale }) {
  const copy = addressCopy[locale];
  return (
    <div className={styles.card}>
      <div className={styles.map} aria-hidden="true">
        <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="addr-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#f3d48f" stopOpacity="0.45" />
              <stop offset="1" stopColor="#f3d48f" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className={styles.blocks}>
            <path d="M20 40h150v90H20zM190 30h120v70H190zM330 20h110v110H330zM460 40h130v80H460z" />
            <path d="M30 160h120v70H30zM170 130h140v110H170zM340 160h100v60H340zM460 150h120v100H460z" />
            <path d="M20 260h160v70H20zM200 270h110v60H200zM330 250h130v80H330zM480 280h110v50H480z" />
          </g>
          <g className={styles.roads}>
            <path d="M0 145C120 150 220 120 320 140S520 170 600 140" />
            <path d="M180 0C185 110 160 220 190 340" />
            <path d="M450 0C440 90 470 200 445 340" />
            <path d="M0 250C150 240 300 262 600 248" />
          </g>
          <path
            className={styles.route}
            d="M60 330C120 290 180 250 230 220S290 180 300 170"
          />
          <circle cx="300" cy="170" r="90" fill="url(#addr-glow)" />
          <g className={styles.pin}>
            <circle className={styles.ping} cx="300" cy="170" r="10" />
            <path d="M300 128c-15 0-26 11-26 25 0 19 26 41 26 41s26-22 26-41c0-14-11-25-26-25Zm0 34a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
          </g>
        </svg>
        <span className={styles.cityTag}>
          {officialAddress.city[locale]} · {officialAddress.country[locale]}
        </span>
      </div>
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
