import Image from 'next/image';

import styles from './gold-accent.module.css';

const accents = {
  thread: { src: '/media/gold/gold-thread-loop.webp', width: 360, height: 116 },
  bookmark: { src: '/media/gold/gold-bookmark.webp', width: 136, height: 200 },
  calendar: {
    src: '/media/gold/gold-calendar-tab.webp',
    width: 217,
    height: 200,
  },
  rings: {
    src: '/media/gold/gold-connected-rings.webp',
    width: 298,
    height: 200,
  },
  dialogue: {
    src: '/media/gold/gold-dialogue-brackets.webp',
    width: 305,
    height: 200,
  },
  workshop: {
    src: '/media/gold/gold-workshop-grid.webp',
    width: 299,
    height: 200,
  },
  notebook: {
    src: '/media/gold/gold-notebook-spine.webp',
    width: 94,
    height: 200,
  },
  archive: {
    src: '/media/gold/gold-archive-divider.webp',
    width: 360,
    height: 120,
  },
} as const;

export function GoldAccent({ name }: { name: keyof typeof accents }) {
  return (
    <Image {...accents[name]} alt="" sizes="100px" className={styles.accent} />
  );
}
