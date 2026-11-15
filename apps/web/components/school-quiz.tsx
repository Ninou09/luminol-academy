'use client';

import { useState } from 'react';

import type { QuizCopy, QuizSchool } from '../lib/school-quiz';
import styles from './school-quiz.module.css';

type SchoolSummary = {
  slug: QuizSchool;
  name: string;
  promise: string;
  href: string;
};

/** Four questions that suggest a starting school; answers stay in the page. */
export function SchoolQuiz({
  copy,
  schools,
  contactHref,
}: {
  copy: QuizCopy;
  schools: readonly SchoolSummary[];
  contactHref: string;
}) {
  const [answers, setAnswers] = useState<QuizSchool[]>([]);
  const step = answers.length;
  const done = step >= copy.questions.length;

  const result: SchoolSummary | undefined = done
    ? [...schools].sort(
        (a, b) =>
          answers.filter((answer) => answer === b.slug).length -
          answers.filter((answer) => answer === a.slug).length,
      )[0]
    : undefined;

  const question = copy.questions[Math.min(step, copy.questions.length - 1)]!;

  return (
    <div className={styles.quiz} data-school={result?.slug}>
      <div className={styles.progress} aria-hidden="true">
        {copy.questions.map((item, index) => (
          <span key={item.question} data-active={index < step || undefined} />
        ))}
      </div>

      {!done ? (
        <fieldset className={styles.panel} key={step}>
          <legend>
            <span className={styles.count}>
              {copy.progress} {step + 1}/{copy.questions.length}
            </span>
            {question.question}
          </legend>
          <div className={styles.options}>
            {question.options.map((option) => (
              <button
                key={option.label}
                type="button"
                className={styles.option}
                onClick={() => setAnswers([...answers, option.school])}
              >
                <span>{option.label}</span>
                <b aria-hidden="true">→</b>
              </button>
            ))}
          </div>
          {step > 0 ? (
            <button
              type="button"
              className={styles.back}
              onClick={() => setAnswers(answers.slice(0, -1))}
            >
              ← {copy.back}
            </button>
          ) : null}
        </fieldset>
      ) : result ? (
        <div className={styles.result} role="status" aria-live="polite">
          <span className={styles.orb} aria-hidden="true" />
          <p className={styles.resultEyebrow}>{copy.resultEyebrow}</p>
          <h3>
            {copy.resultTitle} {result.name}
          </h3>
          <p className={styles.promise}>{result.promise}</p>
          <p className={styles.note}>{copy.resultBody}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={result.href}>
              {copy.openSchool} <span aria-hidden="true">→</span>
            </a>
            <a href={contactHref}>{copy.talk}</a>
            <button
              type="button"
              className={styles.back}
              onClick={() => setAnswers([])}
            >
              ↺ {copy.restart}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
