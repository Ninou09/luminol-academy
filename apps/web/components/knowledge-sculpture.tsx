import type { CSSProperties } from 'react';

import styles from './knowledge-sculpture.module.css';

/** Original CSS geometry: pages opening toward light, never an interactive control. */
export function KnowledgeSculpture({ className = '' }: { className?: string }) {
  return (
    <div
      className={`${styles.stage} ${className}`}
      aria-hidden="true"
      data-knowledge-sculpture
    >
      <div className={styles.aura} />
      <div className={styles.shadow} />
      <div className={styles.object}>
        {[-64, -38, -12, 14, 40, 66].map((angle, index) => (
          <span
            key={angle}
            className={styles.page}
            style={
              {
                '--leaf-angle': `${angle}deg`,
                '--leaf-index': index,
              } as CSSProperties
            }
          >
            <span className={styles.edge} />
          </span>
        ))}
        <span className={styles.spine} />
      </div>
      <div className={styles.caption}>
        <span>Lu.</span>
        <span>
          LUMINOL
          <br />
          ACADEMY
        </span>
      </div>
    </div>
  );
}
