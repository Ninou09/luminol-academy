'use client';

import type { Locale } from '@luminol/localization';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { peoplePhotos } from '../lib/people-photos';

import styles from './breathing-space.module.css';

type Phase = 'inhale' | 'hold' | 'exhale';

/** Calming rhythm: 4 s in, 4 s hold, 6 s out (a longer exhale relaxes). */
const rhythm: Array<{ phase: Phase; seconds: number }> = [
  { phase: 'inhale', seconds: 4 },
  { phase: 'hold', seconds: 4 },
  { phase: 'exhale', seconds: 6 },
];
const cycleSeconds = rhythm.reduce((sum, step) => sum + step.seconds, 0);

const copy = {
  en: {
    eyebrow: 'A moment for you',
    title: 'Breathe with the light.',
    body: 'Psychology begins with noticing. Take one minute: follow the light as it grows and softens, and let your breath slow down with it.',
    start: 'Start breathing',
    pause: 'Pause',
    ready: 'Ready when you are',
    phases: { inhale: 'Breathe in', hold: 'Hold', exhale: 'Breathe out' },
    cycles: 'Breaths',
    note: 'A gentle relaxation exercise. It is not a substitute for professional care.',
  },
  fr: {
    eyebrow: 'Un moment pour vous',
    title: 'Respirez avec la lumière.',
    body: 'La psychologie commence par l’attention portée à soi. Prenez une minute : suivez la lumière qui grandit puis s’apaise, et laissez votre respiration ralentir avec elle.',
    start: 'Commencer',
    pause: 'Pause',
    ready: 'Quand vous voulez',
    phases: { inhale: 'Inspirez', hold: 'Retenez', exhale: 'Expirez' },
    cycles: 'Respirations',
    note: 'Un exercice de relaxation doux. Il ne remplace pas un accompagnement professionnel.',
  },
  ar: {
    eyebrow: 'لحظة من أجلك',
    title: 'تنفّس مع النور.',
    body: 'يبدأ علم النفس بالانتباه إلى الذات. خذ دقيقة واحدة: تابع النور وهو يتسع ثم يهدأ، ودع أنفاسك تتباطأ معه.',
    start: 'ابدأ التنفس',
    pause: 'إيقاف مؤقت',
    ready: 'عندما تكون مستعدًا',
    phases: { inhale: 'شهيق', hold: 'احبس النفس', exhale: 'زفير' },
    cycles: 'الأنفاس',
    note: 'تمرين استرخاء لطيف، ولا يُغني عن المرافقة المتخصصة.',
  },
} as const satisfies Record<Locale, unknown>;

export function BreathingSpace({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [cycles, setCycles] = useState(0);
  const orbRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!running) return;
    const orb = orbRef.current;
    const ring = ringRef.current;
    let frame = 0;
    let lastPhase: Phase | null = null;
    let lastCycle = -1;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      const cycle = Math.floor(elapsed / cycleSeconds);
      let within = elapsed % cycleSeconds;
      let step = rhythm[0]!;
      for (const candidate of rhythm) {
        step = candidate;
        if (within < candidate.seconds) break;
        within -= candidate.seconds;
      }
      const t = Math.min(1, within / step.seconds);
      const eased = 0.5 - Math.cos(Math.PI * t) / 2;
      // 0 = resting, 1 = full lungs.
      const fill =
        step.phase === 'inhale' ? eased : step.phase === 'hold' ? 1 : 1 - eased;
      orb?.style.setProperty('--breath', fill.toFixed(4));
      if (ring) ring.style.strokeDashoffset = String(1 - t);
      if (countRef.current)
        countRef.current.textContent = String(
          Math.max(1, Math.ceil(step.seconds - within)),
        );
      if (step.phase !== lastPhase) {
        lastPhase = step.phase;
        setPhase(step.phase);
      }
      if (cycle !== lastCycle) {
        lastCycle = cycle;
        setCycles(cycle);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      orb?.style.setProperty('--breath', '0');
    };
  }, [running]);

  const toggle = () => {
    if (running) setPhase(null);
    setRunning(!running);
  };

  return (
    <section
      className={styles.space}
      aria-labelledby="breathing-title"
      data-breathing={running ? (phase ?? 'inhale') : 'idle'}
    >
      <Image
        className={styles.photo}
        src={peoplePhotos.homeBreathe.src}
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
      />
      <span className={styles.photoVeil} aria-hidden="true" />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h2 id="breathing-title" className={styles.title} data-split>
          {text.title}
        </h2>
        <p className={styles.body}>{text.body}</p>
        <button
          type="button"
          className={styles.control}
          onClick={toggle}
          aria-pressed={running}
          data-magnetic
        >
          <span aria-hidden="true">{running ? 'Ⅱ' : '▶'}</span>
          {running ? text.pause : text.start}
        </button>
        <p className={styles.note}>{text.note}</p>
      </div>

      <div className={styles.stage}>
        <div ref={orbRef} className={styles.orb} aria-hidden="true">
          <span className={styles.aura} />
          <span className={styles.halo} />
          <span className={styles.ripple} />
          <span className={styles.ripple} />
          <span className={styles.core} />
          <svg className={styles.ring} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" pathLength={1} />
            <circle ref={ringRef} cx="60" cy="60" r="56" pathLength={1} />
          </svg>
        </div>
        <div className={styles.readout}>
          <p className={styles.phase} aria-live="polite">
            {running && phase ? text.phases[phase] : text.ready}
          </p>
          <p className={styles.meta} aria-hidden="true">
            <span ref={countRef} className={styles.count}>
              {running ? '' : '·'}
            </span>
            <span>
              {text.cycles} · {cycles}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
