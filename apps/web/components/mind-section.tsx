'use client';

import { GoldAccent } from './gold-accent';
import { useMotionAllowed } from '../lib/calm-mode';

import { localizeHref, type Locale } from '@luminol/localization';
import { useEffect, useRef } from 'react';

import type { MindScene } from './mind-scene';
import { observeScene } from '../lib/visible-scene';
import Image from 'next/image';
import { psychologyArtwork, brandArtworkCredit } from '../lib/academy-media';
import styles from './mind-section.module.css';

const copy = {
  en: {
    eyebrow: 'Inside the mind',
    title: 'Every thought is a connection.',
    body: 'Psychology studies how thoughts, feelings and actions shape one another.',
    library: 'Explore psychology resources',
    labels: ['Thoughts', 'Feelings', 'Actions'],
  },
  fr: {
    eyebrow: 'Au cœur de l’esprit',
    title: 'Chaque pensée est une connexion.',
    body: 'La psychologie étudie la façon dont les pensées, les émotions et les actions s’influencent.',
    library: 'Consulter la bibliothèque de psychologie',
    labels: ['Pensées', 'Émotions', 'Actions'],
  },
  ar: {
    eyebrow: 'داخل العقل',
    title: 'كل فكرة هي اتصال.',
    body: 'يدرس علم النفس كيف تؤثر الأفكار والمشاعر والأفعال في بعضها البعض.',
    library: 'تصفّح مكتبة علم النفس',
    labels: ['الأفكار', 'المشاعر', 'الأفعال'],
  },
} as const satisfies Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    body: string;
    library: string;
    labels: readonly string[];
  }
>;

export function MindSection({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const allowMotion = useMotionAllowed();
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!allowMotion || !section || !canvas) return;
    let scene: MindScene | null = null;
    const steer = (event: PointerEvent) => {
      if (!scene || event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      scene.setPointer(
        2 * ((event.clientX - rect.left) / rect.width) - 1,
        2 * ((event.clientY - rect.top) / rect.height) - 1,
      );
    };
    const reset = () => scene?.setPointer(0, 0);
    canvas.addEventListener('pointermove', steer);
    canvas.addEventListener('pointerleave', reset);
    const dispose = observeScene(section, async () => {
      const { createMindScene } = await import('./mind-scene');
      return () => {
        scene = createMindScene(canvas, {
          compact: true,
          mobile: window.matchMedia('(max-width: 760px)').matches,
        });
        scene?.setProgress(1);
        return scene;
      };
    });
    return () => {
      canvas.removeEventListener('pointermove', steer);
      canvas.removeEventListener('pointerleave', reset);
      dispose();
    };
  }, [allowMotion]);

  return (
    <section
      ref={sectionRef}
      className={styles.mind}
      aria-labelledby="mind-title"
    >
      <div className={styles.stage}>
        <div
          className={styles.visual}
          data-media-source={brandArtworkCredit.source}
          data-media-license={brandArtworkCredit.license}
          data-media-crop="center-center"
        >
          <Image
            fill
            sizes="(max-width: 760px) 100vw, 45vw"
            src={psychologyArtwork.neuronTree.src}
            alt=""
          />
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            aria-hidden="true"
          />
        </div>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h2 id="mind-title" className={styles.title} data-no-split>
            {text.title}
          </h2>
          <GoldAccent name="thread" />
          <p className={styles.body}>{text.body}</p>
          <ul className={styles.labels} data-no-split>
            {text.labels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
          <a
            className={styles.libraryLink}
            href={localizeHref(locale, '/psy-library')}
          >
            {text.library}
          </a>
        </div>
      </div>
    </section>
  );
}
