'use client';

import type { Locale } from '@luminol/localization';
import { useEffect, useRef } from 'react';

import type { MindScene } from './mind-scene';
import styles from './mind-section.module.css';

const copy = {
  en: {
    eyebrow: 'Inside the mind',
    title: 'Every thought is a connection.',
    body: 'Psychology studies how thoughts, feelings and actions shape one another. Scroll to watch a mind light up, one connection at a time.',
    labels: ['Thoughts', 'Feelings', 'Actions'],
  },
  fr: {
    eyebrow: 'Au cœur de l’esprit',
    title: 'Chaque pensée est une connexion.',
    body: 'La psychologie étudie la façon dont les pensées, les émotions et les actions s’influencent. Faites défiler pour voir un esprit s’éclairer, une connexion après l’autre.',
    labels: ['Pensées', 'Émotions', 'Actions'],
  },
  ar: {
    eyebrow: 'داخل العقل',
    title: 'كل فكرة هي اتصال.',
    body: 'يدرس علم النفس كيف تؤثر الأفكار والمشاعر والأفعال في بعضها البعض. مرّر لترى عقلًا يضيء، اتصالًا بعد اتصال.',
    labels: ['الأفكار', 'المشاعر', 'الأفعال'],
  },
} as const satisfies Record<
  Locale,
  { eyebrow: string; title: string; body: string; labels: readonly string[] }
>;

export function MindSection({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let scene: MindScene | null = null;
    let disposed = false;
    let inView = false;
    let frame = 0;

    const progressOf = () => {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      return travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    };
    const sync = () => {
      frame = 0;
      if (!scene || !inView) return;
      const progress = progressOf();
      scene.setProgress(progress);
      section.style.setProperty('--mind-progress', progress.toFixed(3));
      scene.getAnchors().forEach((anchor, index) => {
        const label = labelRefs.current[index];
        if (!label) return;
        label.style.setProperty('--x', `${anchor.x.toFixed(1)}px`);
        label.style.setProperty('--y', `${anchor.y.toFixed(1)}px`);
        label.style.setProperty('--visible', anchor.visible.toFixed(3));
        // Flip to the other side of the anchor when the label would overflow.
        const room = label.offsetWidth + 40;
        label.dataset.side =
          anchor.x + room > section.clientWidth - 8 ? 'before' : 'after';
      });
      frame = requestAnimationFrame(sync);
    };
    const onPointer = (event: PointerEvent) => {
      scene?.setPointer(
        (event.clientX / window.innerWidth - 0.5) * 2,
        (event.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    const boot = async () => {
      const { createMindScene } = await import('./mind-scene');
      if (disposed) return;
      scene = createMindScene(canvas, {
        mobile: window.matchMedia('(max-width: 760px)').matches,
      });
      if (!scene) return;
      section.dataset.scene = 'live';
      if (inView) {
        scene.start();
        frame = requestAnimationFrame(sync);
      }
    };
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        loader.disconnect();
        void boot();
      },
      { rootMargin: '120% 0px' },
    );
    loader.observe(section);
    const visibility = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      if (!scene) return;
      if (inView && !document.hidden) {
        scene.start();
        if (!frame) frame = requestAnimationFrame(sync);
      } else scene.stop();
    });
    visibility.observe(section);
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      loader.disconnect();
      visibility.disconnect();
      window.removeEventListener('pointermove', onPointer);
      scene?.destroy();
      delete section.dataset.scene;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.mind}
      aria-labelledby="mind-title"
    >
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h2 id="mind-title" className={styles.title} data-no-split>
            {text.title}
          </h2>
          <p className={styles.body}>{text.body}</p>
        </div>
        <ul className={styles.labels} data-no-split>
          {text.labels.map((label, index) => (
            <li
              key={label}
              ref={(element) => {
                labelRefs.current[index] = element;
              }}
              className={styles.label}
            >
              <span className={styles.dot} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
