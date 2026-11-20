'use client';

import { useMotionAllowed } from '../lib/calm-mode';

import { useEffect, useRef } from 'react';

import { observeScene } from '../lib/visible-scene';
import styles from './school-constellation.module.css';

export type ConstellationSchool = {
  slug: string;
  number: string;
  name: string;
  href: string;
};

type SchoolConstellationProps = {
  eyebrow: string;
  title: string;
  hint: string;
  schools: ConstellationSchool[];
};

/** Brand tints for the three glass spheres (psychology, languages, training). */
const tints: [string, string, string] = ['#3fb8a9', '#5b8fd6', '#d09a62'];

export function SchoolConstellation({
  eyebrow,
  title,
  hint,
  schools,
}: SchoolConstellationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<Array<HTMLLIElement | null>>([]);
  const selected = useRef<number | null>(null);
  const allowMotion = useMotionAllowed();
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!allowMotion || !section || !canvas) return;
    return observeScene(
      section,
      async () => {
        const { createConstellationScene } =
          await import('./constellation-scene');
        return () =>
          createConstellationScene(canvas, {
            tints,
            mobile: window.matchMedia('(max-width: 760px)').matches,
          });
      },
      (scene) => {
        scene.setSelected(selected.current);
        const top = canvas.offsetTop;
        scene.getAnchors().forEach(({ x, y }, index) => {
          const label = labelRefs.current[index];
          label?.style.setProperty('--x', `${x}px`);
          label?.style.setProperty('--y', `${y + top}px`);
        });
      },
    );
  }, [allowMotion]);

  return (
    <section
      ref={sectionRef}
      className={styles.constellation}
      aria-labelledby="constellation-title"
    >
      <div className={styles.stage}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id="constellation-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.hint} aria-hidden="true">
            {hint}
          </p>
        </div>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <ol className={styles.labels}>
          {schools.map((school, index) => (
            <li
              key={school.slug}
              ref={(element) => {
                labelRefs.current[index] = element;
              }}
              className={styles.label}
            >
              <a
                href={school.href}
                onPointerEnter={() => {
                  selected.current = index;
                }}
                onPointerLeave={() => {
                  selected.current = null;
                }}
                onFocus={() => {
                  selected.current = index;
                }}
                onBlur={() => {
                  selected.current = null;
                }}
              >
                <span className={styles.labelNumber}>{school.number}</span>
                <strong>{school.name}</strong>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
