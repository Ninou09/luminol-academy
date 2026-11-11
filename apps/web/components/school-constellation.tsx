'use client';

import { useEffect, useRef } from 'react';

import type { ConstellationScene } from './constellation-scene';
import styles from './school-constellation.module.css';

export type ConstellationSchool = {
  slug: string;
  number: string;
  name: string;
  promise: string;
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

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;

    let scene: ConstellationScene | null = null;
    let disposed = false;
    let inView = false;
    let frame = 0;

    const progressOf = () => {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      return travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    };

    // Labels ride on their spheres; read positions each frame from the scene.
    const syncLabels = () => {
      frame = 0;
      if (!scene || !inView) return;
      const progress = progressOf();
      scene.setProgress(progress);
      section.style.setProperty(
        '--constellation-progress',
        progress.toFixed(3),
      );
      scene.getAnchors().forEach((anchor, index) => {
        const label = labelRefs.current[index];
        if (!label) return;
        label.style.setProperty('--x', `${anchor.x.toFixed(1)}px`);
        label.style.setProperty('--y', `${anchor.y.toFixed(1)}px`);
        label.style.setProperty('--visible', anchor.visible.toFixed(3));
        // Labels sit on the outward side of their sphere, never over the core,
        // and flip inward only when they would leave the screen.
        const stageWidth = section.clientWidth;
        const room = label.offsetWidth + 72;
        let side = anchor.x < stageWidth / 2 ? 'before' : 'after';
        if (side === 'before' && anchor.x - room < 8) side = 'after';
        if (side === 'after' && anchor.x + room > stageWidth - 8)
          side = 'before';
        label.dataset.side = side;
        if (anchor.visible > 0.5) label.dataset.active = '';
        else delete label.dataset.active;
      });
      frame = requestAnimationFrame(syncLabels);
    };

    const onPointerMove = (event: PointerEvent) => {
      scene?.setPointer(
        (event.clientX / window.innerWidth - 0.5) * 2,
        (event.clientY / window.innerHeight - 0.5) * 2,
      );
    };

    const boot = async () => {
      const { createConstellationScene } =
        await import('./constellation-scene');
      if (disposed) return;
      scene = createConstellationScene(canvas, {
        tints,
        mobile: window.matchMedia('(max-width: 760px)').matches,
      });
      if (!scene) return;
      section.dataset.scene = 'live';
      if (inView) {
        scene.start();
        frame = requestAnimationFrame(syncLabels);
      }
    };

    // Load three.js only when the section is about one screen away.
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        loader.disconnect();
        void boot();
      },
      { rootMargin: '100% 0px' },
    );
    loader.observe(section);

    const visibility = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      if (!scene) return;
      if (inView && !document.hidden) {
        scene.start();
        if (!frame) frame = requestAnimationFrame(syncLabels);
      } else {
        scene.stop();
      }
    });
    visibility.observe(section);

    const onVisibility = () => {
      if (!scene) return;
      if (document.hidden) scene.stop();
      else if (inView) scene.start();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      loader.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      scene?.destroy();
      delete section.dataset.scene;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.constellation}
      aria-labelledby="constellation-title"
    >
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id="constellation-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.hint} aria-hidden="true">
            <span />
            {hint}
          </p>
        </div>
        <ol className={styles.labels}>
          {schools.map((school, index) => (
            <li
              key={school.slug}
              ref={(element) => {
                labelRefs.current[index] = element;
              }}
              className={styles.label}
            >
              <a href={school.href}>
                <span className={styles.labelNumber}>{school.number}</span>
                <strong>{school.name}</strong>
                <span className={styles.labelPromise}>{school.promise}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
