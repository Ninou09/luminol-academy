'use client';

import { useEffect, useRef } from 'react';

import styles from './velocity-marquee.module.css';

/**
 * Decorative brand band. It drifts on its own and leans, speeds up and
 * reverses with the visitor's scroll velocity. The words repeat content that
 * is already on the page, so the band is hidden from assistive technology.
 */
export function VelocityMarquee({ words }: { words: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;

    const rtl = document.documentElement.dir === 'rtl' ? -1 : 1;
    let offset = 0;
    let lastScroll = window.scrollY;
    let velocity = 0;
    let direction = 1;
    let frame = 0;
    let inView = false;

    const loop = () => {
      frame = 0;
      if (!inView) return;
      const scroll = window.scrollY;
      const delta = scroll - lastScroll;
      lastScroll = scroll;
      velocity += (delta - velocity) * 0.12;
      if (Math.abs(delta) > 0.5) direction = Math.sign(delta);
      const half = track.scrollWidth / 2;
      offset = (offset + (0.6 + Math.abs(velocity) * 0.35) * direction) % half;
      if (offset < 0) offset += half;
      const skew = Math.max(-12, Math.min(12, velocity * -0.4));
      track.style.transform = `translate3d(${-offset * rtl}px, 0, 0) skewX(${skew}deg)`;
      frame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      lastScroll = window.scrollY;
      if (inView && !frame) frame = requestAnimationFrame(loop);
    });
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const sequence = [...words, ...words];
  return (
    <div className={styles.band} aria-hidden="true">
      <div ref={trackRef} className={styles.track}>
        {[0, 1].map((copy) => (
          <div className={styles.group} key={copy}>
            {sequence.map((word, index) => (
              <span
                key={`${copy}-${index}`}
                className={index % 2 ? styles.outline : styles.solid}
              >
                {word}
                <i className={styles.star} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
