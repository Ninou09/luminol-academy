import Image from 'next/image';

import styles from './academy-logo.module.css';

/** Preserve the supplied artwork; crop the surrounding phone UI with CSS. */
export function AcademyLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`${styles.logo} ${className}`} data-academy-logo>
      <span
        className={styles.mark}
        data-media-source="user-upload:1000077217.jpg"
        data-media-crop="x220-y700-width440-height490"
      >
        <Image
          src="/media/luminol-logo-original.jpg"
          alt=""
          width={917}
          height={2048}
          sizes="110px"
          unoptimized
          className={styles.original}
        />
      </span>
      <span className={styles.name}>
        Luminol<span>Academy</span>
      </span>
    </span>
  );
}
