import Image from 'next/image';

import styles from './glass-icon.module.css';

/** Commissioned transparent glass icons in /media/brand (720×720 WebP). */
export type GlassIconName =
  | 'about-founding-idea'
  | 'about-mission'
  | 'about-vision'
  | 'value-depth'
  | 'value-warmth'
  | 'value-progress'
  | 'value-connected'
  | 'route-therapy'
  | 'route-family'
  | 'route-learning'
  | 'experience-30-years'
  | 'enquiry-message'
  | 'step-recorded'
  | 'step-review'
  | 'step-reply'
  | 'journey-listen'
  | 'journey-clarity'
  | 'journey-build'
  | 'ws-step-register'
  | 'ws-step-confirm'
  | 'ws-step-calendar'
  | 'ws-step-join'
  | 'certificate-seal';

const sizes = { sm: 72, md: 132, lg: 260, xl: 360 } as const;

/**
 * A decorative glass object that levitates, sways slowly in 3D and catches a
 * soft halo of light. The neighbouring heading carries the meaning, so the
 * image is hidden from assistive technology.
 */
export function GlassIcon({
  name,
  size = 'md',
  className,
  delay = 0,
}: {
  name: GlassIconName;
  size?: keyof typeof sizes;
  className?: string | undefined;
  delay?: number;
}) {
  const pixels = sizes[size];
  return (
    <span
      className={`${styles.icon} ${styles[size]} ${className ?? ''}`}
      style={{ '--icon-delay': `${delay}s` } as React.CSSProperties}
      aria-hidden="true"
      data-glass-icon
    >
      <span className={styles.halo} />
      <Image
        className={styles.image}
        src={`/media/brand/${name}.webp`}
        alt=""
        width={720}
        height={720}
        sizes={`${pixels * 2}px`}
      />
    </span>
  );
}
