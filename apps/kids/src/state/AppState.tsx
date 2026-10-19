import type { SpeechItem, Utterance } from '@luminol/kids-content';
import {
  DEFAULT_SENSORY_SETTINGS,
  isSkillPlayable,
  planSession,
  playableInterests,
  SKILL_IDS,
  type ChildProfile,
  type Plan,
  type ScheduleStep,
  type SessionRecord,
} from '@luminol/kids-learning';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState as NativeAppState } from 'react-native';

import type { KidsServices } from '../services/services';

export type ActiveSession = {
  record: SessionRecord;
  steps: ScheduleStep[];
};

type AppStateValue = {
  services: KidsServices;
  profiles: ChildProfile[];
  activeChild: ChildProfile | null;
  selectChild: (childId: string | null) => void;
  saveProfile: (profile: ChildProfile) => Promise<void>;
  deleteProfile: (childId: string) => Promise<void>;
  parentUnlocked: boolean;
  unlockParent: () => void;
  lockParent: () => void;
  session: ActiveSession | null;
  startSession: () => Promise<ActiveSession | null>;
  completeActivity: () => Promise<void>;
  noteCalmVisit: () => Promise<void>;
  endSession: () => Promise<void>;
  /** Speaks with the active child's dialect, volume and voice speed. */
  say: (utterance: Utterance) => void;
  /** Speaks several items in order, e.g. a communication board sentence. */
  sayItems: (items: readonly SpeechItem[]) => void;
  /** Free or Plus, as the store last reported it. */
  plan: Plan;
  setPlan: (plan: Plan) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({
  services,
  initialProfiles,
  children,
}: {
  services: KidsServices;
  initialProfiles: ChildProfile[];
  children: ReactNode;
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [plan, setPlan] = useState<Plan>('free');
  const starting = useRef<{
    childId: string;
    promise: Promise<ActiveSession>;
  } | null>(null);

  const activeChild =
    profiles.find((profile) => profile.id === activeChildId) ?? null;

  // The parent area locks whenever the app leaves the foreground.
  useEffect(() => {
    const subscription = NativeAppState.addEventListener('change', (status) => {
      if (status !== 'active') setParentUnlocked(false);
    });
    return () => subscription.remove();
  }, []);

  // The plan starts as Free and follows the store from then on.
  useEffect(() => {
    let active = true;
    void services.purchases.currentPlan().then((current) => {
      if (active) setPlan(current);
    });
    const unsubscribe = services.purchases.onPlanChange(setPlan);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [services]);

  const unlockParent = useCallback(() => setParentUnlocked(true), []);
  const lockParent = useCallback(() => setParentUnlocked(false), []);

  const persistSession = useCallback(
    async (next: ActiveSession) => {
      await services.repository.saveSession(next.record);
      setSession(next);
    },
    [services],
  );

  const selectChild = useCallback((childId: string | null) => {
    setActiveChildId(childId);
    setSession(null);
  }, []);

  const saveProfile = useCallback(
    async (profile: ChildProfile) => {
      await services.repository.saveProfile(profile);
      setProfiles(await services.repository.listProfiles());
    },
    [services],
  );

  const deleteProfile = useCallback(
    async (childId: string) => {
      await services.repository.deleteProfile(childId);
      services.media.removeChild(childId);
      if (activeChildId === childId) selectChild(null);
      setProfiles(await services.repository.listProfiles());
    },
    [activeChildId, selectChild, services],
  );

  const startSession = useCallback(async () => {
    if (!activeChild) return null;
    if (session && session.record.childId === activeChild.id) return session;
    // Effects can run twice in development; reuse a session already being created.
    if (starting.current?.childId === activeChild.id)
      return starting.current.promise;
    const child = activeChild;
    const promise = (async () => {
      const previousSessions = await services.repository.countSessions(
        child.id,
      );
      const next: ActiveSession = {
        steps: planSession({
          ageBand: child.ageBand,
          sessionMinutes: child.sensory.sessionMinutes,
          previousSessions,
          interests: playableInterests(child.interests, plan),
          disabledSkills: child.disabledSkills,
          lockedSkills: SKILL_IDS.filter(
            (skillId) => !isSkillPlayable(plan, skillId),
          ),
        }),
        record: {
          id: services.newId(),
          childId: child.id,
          startedAt: services.now().toISOString(),
          endedAt: null,
          activitiesCompleted: 0,
          calmVisits: 0,
        },
      };
      await persistSession(next);
      return next;
    })();
    starting.current = { childId: child.id, promise };
    try {
      return await promise;
    } finally {
      starting.current = null;
    }
  }, [activeChild, persistSession, plan, services, session]);

  const completeActivity = useCallback(async () => {
    if (!session) return;
    await persistSession({
      ...session,
      record: {
        ...session.record,
        activitiesCompleted: session.record.activitiesCompleted + 1,
      },
    });
  }, [persistSession, session]);

  const noteCalmVisit = useCallback(async () => {
    if (!session) return;
    await persistSession({
      ...session,
      record: { ...session.record, calmVisits: session.record.calmVisits + 1 },
    });
  }, [persistSession, session]);

  const endSession = useCallback(async () => {
    if (session) {
      await services.repository.saveSession({
        ...session.record,
        endedAt: services.now().toISOString(),
      });
    }
    services.speech.stop();
    selectChild(null);
  }, [selectChild, services, session]);

  const sayItems = useCallback(
    (items: readonly SpeechItem[]) => {
      const sensory = activeChild?.sensory ?? DEFAULT_SENSORY_SETTINGS;
      services.speech.sayAll(items, {
        dialect: activeChild?.dialect ?? 'msa',
        volume: sensory.volume,
        voiceSpeed: sensory.voiceSpeed,
      });
    },
    [activeChild, services],
  );

  const say = useCallback(
    (utterance: Utterance) => sayItems([{ utterance }]),
    [sayItems],
  );

  const value = useMemo<AppStateValue>(
    () => ({
      services,
      profiles,
      activeChild,
      selectChild,
      saveProfile,
      deleteProfile,
      parentUnlocked,
      unlockParent,
      lockParent,
      session,
      startSession,
      completeActivity,
      noteCalmVisit,
      endSession,
      say,
      sayItems,
      plan,
      setPlan,
    }),
    [
      plan,
      activeChild,
      completeActivity,
      deleteProfile,
      endSession,
      lockParent,
      noteCalmVisit,
      parentUnlocked,
      profiles,
      saveProfile,
      say,
      sayItems,
      selectChild,
      services,
      session,
      startSession,
      unlockParent,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value)
    throw new Error('useAppState must be used inside AppStateProvider.');
  return value;
}
