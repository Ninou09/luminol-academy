import {
  goalStatus,
  summarizeActivity,
  summarizeSkills,
  summarizeWeek,
  type ActivitySummary,
  type ChildGoals,
  type GoalStatus,
  type SessionRecord,
  type SkillSummary,
  type WeekSummary,
} from '@luminol/kids-learning';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAppState } from '../state/AppState';

export type ProgressView = {
  activity: ActivitySummary;
  week: WeekSummary;
  skills: SkillSummary[];
  goals: ChildGoals;
  goalStatuses: GoalStatus[];
  /** The latest sessions, newest first. */
  sessions: SessionRecord[];
};

export const HISTORY_LENGTH = 10;

/** A child's progress, recomputed whenever the screen comes into focus. */
export function useProgress(childId: string | undefined) {
  const { services } = useAppState();
  const [view, setView] = useState<ProgressView | null>(null);

  const load = useCallback(async () => {
    if (!childId) return null;
    const { repository } = services;
    const [trials, progress, sessions, goals] = await Promise.all([
      repository.listTrials(childId),
      repository.listProgress(childId),
      repository.listSessions(childId),
      repository.getGoals(childId),
    ]);
    const bySkill = new Map(progress.map((entry) => [entry.skillId, entry]));
    return {
      activity: summarizeActivity(sessions, trials, services.now()),
      week: summarizeWeek(sessions, trials, services.now()),
      skills: summarizeSkills(trials, progress),
      goals,
      goalStatuses: goals.items.map((goal) =>
        goalStatus(goal, bySkill.get(goal.skillId) ?? null),
      ),
      sessions: sessions.slice(0, HISTORY_LENGTH),
    };
  }, [childId, services]);

  const reload = useCallback(async () => {
    setView(await load());
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void load().then((loaded) => {
        if (active) setView(loaded);
      });
      return () => {
        active = false;
      };
    }, [load]),
  );

  return { view, reload };
}
