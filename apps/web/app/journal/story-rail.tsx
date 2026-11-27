'use client';

import type { Locale } from '@luminol/localization';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useMotionAllowed } from '../../lib/calm-mode';
import styles from './journal.module.css';

const labels = {
  en: ['Journal stories', 'Previous story', 'Next story'],
  fr: ['Articles du journal', 'Article précédent', 'Article suivant'],
  ar: ['مقالات المجلة', 'المقال السابق', 'المقال التالي'],
} as const satisfies Record<Locale, readonly string[]>;

export function StoryRail({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const motion = useMotionAllowed();
  const rtl = locale === 'ar';
  const [title, previous, next] = labels[locale];

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    function update() {
      if (!element) return;
      const position = Math.abs(element.scrollLeft);
      const start = position <= 1;
      const end = position >= element.scrollWidth - element.clientWidth - 1;
      setEdges((previous) =>
        previous.start === start && previous.end === end
          ? previous
          : { start, end },
      );
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, []);

  function move(direction: number) {
    const element = track.current;
    const [first, second] = Array.from(element?.children ?? []);
    if (!element || !first || !second) return;
    const step =
      second.getBoundingClientRect().left - first.getBoundingClientRect().left;
    element.scrollBy({
      left: direction * step,
      behavior: motion ? 'smooth' : 'instant',
    });
  }

  return (
    <section className={styles.stories} aria-labelledby="journal-stories-title">
      <h2 id="journal-stories-title" className={styles.storiesTitle}>
        {title}
      </h2>
      <div className={styles.storyFrame}>
        <button
          type="button"
          className={styles.storyPrevious}
          aria-label={previous}
          aria-controls="journal-stories"
          disabled={edges.start}
          onClick={() => move(-1)}
        >
          <span aria-hidden="true">{rtl ? '→' : '←'}</span>
        </button>
        <ul
          ref={track}
          tabIndex={0}
          id="journal-stories"
          aria-label={title}
          className={styles.storyTrack}
          data-lenis-prevent-horizontal
        >
          {children}
        </ul>
        <button
          type="button"
          className={styles.storyNext}
          aria-label={next}
          aria-controls="journal-stories"
          disabled={edges.end}
          onClick={() => move(1)}
        >
          <span aria-hidden="true">{rtl ? '←' : '→'}</span>
        </button>
      </div>
    </section>
  );
}
