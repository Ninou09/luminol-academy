import { phrase, praiseFor, type Utterance } from '@luminol/kids-content';
import {
  applyTrial,
  createRandom,
  createSkillProgress,
  escalateAssist,
  initialAssist,
  maxLevel,
  type AssistStep,
  type Random,
  type Skill,
  type SkillProgress,
} from '@luminol/kids-learning';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppState } from '../state/AppState';

export type TrialPhase = 'loading' | 'playing' | 'celebrating' | 'done';

/** How long praise stays on screen before the next trial. Never shown as a timer. */
export const CELEBRATE_MS = 1400;

type FlowState = {
  phase: TrialPhase;
  progress: SkillProgress | null;
  /** The level the current trial was generated at; fixed until the next trial. */
  level: number;
  trialIndex: number;
  assist: AssistStep;
  earned: number;
};

export type TrialFlow = FlowState & {
  trials: number;
  random: Random;
  /** Reports the child's response. Wrong responses only add help. */
  respond: (correct: boolean) => void;
};

export type TrialFlowOptions = {
  skill: Skill;
  trials: number;
  /** Spoken at the start of every trial. */
  instruction: Utterance;
  /** Names the current target; spoken at the `audio` help step. */
  hint: () => Utterance;
  /** Replaces the default rotating praise, e.g. naming the touched shape. */
  praise?: (trialIndex: number) => Utterance;
};

export function useTrialFlow({
  skill,
  trials,
  instruction,
  hint,
  praise,
}: TrialFlowOptions): TrialFlow {
  const { services, activeChild, session, say } = useAppState();
  const randomRef = useRef<Random | null>(null);
  randomRef.current ??= createRandom(services.seed());
  const [state, setState] = useState<FlowState>({
    phase: 'loading',
    progress: null,
    level: 1,
    trialIndex: 0,
    assist: 'none',
    earned: 0,
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const attempt = useRef({ wrong: 0, escalated: false, startedAt: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ instruction, hint, praise, say });
  latest.current = { instruction, hint, praise, say };

  const begin = useCallback(
    (progress: SkillProgress, trialIndex: number, earned: number) => {
      attempt.current = {
        wrong: 0,
        escalated: false,
        startedAt: services.now().getTime(),
      };
      const next: FlowState = {
        phase: 'playing',
        progress,
        level: progress.level,
        trialIndex,
        assist: initialAssist(progress.promptLevel),
        earned,
      };
      stateRef.current = next;
      setState(next);
      latest.current.say(latest.current.instruction);
    },
    [services],
  );

  const childId = activeChild?.id;
  useEffect(() => {
    if (!childId) return;
    let cancelled = false;
    void services.repository.getProgress(childId, skill.id).then((stored) => {
      if (!cancelled) begin(stored ?? createSkillProgress(skill.id), 0, 0);
    });
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [begin, childId, services, skill.id]);

  const respond = useCallback(
    (correct: boolean) => {
      const current = stateRef.current;
      if (current.phase !== 'playing' || !current.progress || !childId) return;

      if (!correct) {
        attempt.current.wrong += 1;
        const assist = escalateAssist(current.assist);
        if (assist === 'guide' && current.assist !== 'guide')
          attempt.current.escalated = true;
        const next = { ...current, assist };
        stateRef.current = next;
        setState(next);
        latest.current.say(
          assist === 'audio' ? latest.current.hint() : phrase('hint.look'),
        );
        return;
      }

      const now = services.now();
      const { progress } = applyTrial(
        current.progress,
        {
          firstTryCorrect: attempt.current.wrong === 0,
          escalatedToGuide: attempt.current.escalated,
        },
        maxLevel(skill),
        now,
      );
      const earned = current.earned + 1;
      const celebrating: FlowState = {
        ...current,
        phase: 'celebrating',
        progress,
        earned,
      };
      stateRef.current = celebrating;
      setState(celebrating);
      latest.current.say(
        (latest.current.praise ?? praiseFor)(current.trialIndex),
      );

      if (session) {
        services.repository
          .recordTrial(
            {
              childId,
              sessionId: session.record.id,
              skillId: skill.id,
              level: current.progress.level,
              promptLevel: current.progress.promptLevel,
              firstTryCorrect: attempt.current.wrong === 0,
              wrongAttempts: attempt.current.wrong,
              escalatedToGuide: attempt.current.escalated,
              responseMs: Math.max(
                0,
                now.getTime() - attempt.current.startedAt,
              ),
              at: now.toISOString(),
            },
            progress,
          )
          .catch((error: unknown) =>
            console.warn('Could not save trial', error),
          );
      }

      timer.current = setTimeout(() => {
        const nextIndex = current.trialIndex + 1;
        if (nextIndex >= trials) {
          const done: FlowState = { ...celebrating, phase: 'done' };
          stateRef.current = done;
          setState(done);
          return;
        }
        begin(progress, nextIndex, earned);
      }, CELEBRATE_MS);
    },
    [begin, childId, services, session, skill, trials],
  );

  return {
    ...state,
    trials,
    random: randomRef.current,
    respond,
  };
}
