import { describePiece } from '@luminol/kids-content';
import {
  createSkillProgress,
  PIECE_COLORS,
  SHAPES,
  SKILLS,
  type ChildProfile,
} from '@luminol/kids-learning';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import {
  addChild,
  createTestServices,
  WithChild,
  type TestServices,
} from '../test/support';
import { CauseEffectGame } from './CauseEffectGame';
import { MatchingGame } from './MatchingGame';
import { SortingGame } from './SortingGame';
import { CELEBRATE_MS } from './useTrialFlow';

jest.useFakeTimers();

async function renderGame(
  element: (onDone: () => void) => React.ReactElement,
  prepare?: (services: TestServices, child: ChildProfile) => Promise<void>,
) {
  const services = await createTestServices(7);
  const child = await addChild(services);
  await prepare?.(services, child);
  const onDone = jest.fn();
  render(
    <WithChild services={services} profiles={[child]} childId={child.id}>
      {element(onDone)}
    </WithChild>,
  );
  await screen.findByTestId('game-instruction');
  return { services, child, onDone };
}

async function nextTrial() {
  await act(async () => {
    jest.advanceTimersByTime(CELEBRATE_MS);
  });
}

function isDisabled(testId: string): boolean {
  return screen.getByTestId(testId).props.accessibilityState?.disabled === true;
}

describe('MatchingGame', () => {
  it('starts errorless: only the correct choice can be pressed', async () => {
    const { services } = await renderGame((onDone) => (
      <MatchingGame trials={5} onDone={onDone} />
    ));
    expect(services.speech.texts()).toContain('لنبحث عن الشكل نفسه');
    const others = screen.getAllByTestId(/^choice-other-/);
    expect(others).toHaveLength(1);
    expect(isDisabled(others[0]!.props.testID)).toBe(true);
    expect(isDisabled('choice-correct')).toBe(false);
  });

  it('praises, records the trial and updates progress on a correct answer', async () => {
    const { services, child } = await renderGame((onDone) => (
      <MatchingGame trials={5} onDone={onDone} />
    ));
    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await services.repository.listTrials(child.id)).toHaveLength(1),
    );
    expect(services.speech.last()).toBe('أحسنت!');
    const [trial] = await services.repository.listTrials(child.id);
    expect(trial).toMatchObject({
      skillId: 'match-shapes',
      promptLevel: 'full',
      firstTryCorrect: true,
    });
    expect(
      await services.repository.getProgress(child.id, 'match-shapes'),
    ).toMatchObject({
      trialCount: 1,
      promptStreak: 1,
    });
  });

  it('adds help one step at a time after wrong answers, never a failure state', async () => {
    const { services, child } = await renderGame(
      (onDone) => <MatchingGame trials={5} onDone={onDone} />,
      async (prepared, profile) => {
        const sessionId = prepared.newId();
        await prepared.repository.saveSession({
          id: sessionId,
          childId: profile.id,
          startedAt: '2026-10-18T08:00:00.000Z',
          endedAt: '2026-10-18T08:10:00.000Z',
          activitiesCompleted: 3,
          calmVisits: 0,
        });
        await prepared.repository.recordTrial(
          {
            childId: profile.id,
            sessionId,
            skillId: 'match-shapes',
            level: 3,
            promptLevel: 'independent',
            firstTryCorrect: true,
            wrongAttempts: 0,
            escalatedToGuide: false,
            responseMs: 500,
            at: '2026-10-18T08:05:00.000Z',
          },
          {
            ...createSkillProgress('match-shapes'),
            level: 3,
            promptLevel: 'independent',
          },
        );
      },
    );
    const wrongId = screen.getAllByTestId(/^choice-other-/)[0]!.props
      .testID as string;
    const targetLabel = screen.getByTestId('choice-correct').props
      .accessibilityLabel as string;

    fireEvent.press(screen.getByTestId(wrongId));
    expect(services.speech.last()).toBe(targetLabel);
    expect(isDisabled(wrongId)).toBe(false);

    fireEvent.press(screen.getByTestId(wrongId));
    expect(services.speech.last()).toBe('لننظر هنا');

    fireEvent.press(screen.getByTestId(wrongId));
    expect(isDisabled(wrongId)).toBe(true);

    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await services.repository.listTrials(child.id)).toHaveLength(2),
    );
    const trials = await services.repository.listTrials(child.id);
    expect(trials[1]).toMatchObject({
      level: 3,
      promptLevel: 'independent',
      firstTryCorrect: false,
      wrongAttempts: 3,
      escalatedToGuide: true,
    });
    expect(services.speech.texts().join(' ')).not.toMatch(/خطأ|خاطئ|غلط/);
  });

  it('finishes the activity after the planned number of trials', async () => {
    const { onDone, services, child } = await renderGame((done) => (
      <MatchingGame trials={3} onDone={done} />
    ));
    for (let trial = 0; trial < 3; trial += 1) {
      fireEvent.press(screen.getByTestId('choice-correct'));
      await nextTrial();
    }
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(await services.repository.listTrials(child.id)).toHaveLength(3);
    expect(
      await services.repository.getProgress(child.id, 'match-shapes'),
    ).toMatchObject({
      promptLevel: 'partial',
    });
  });

  it('ignores presses while praise is showing', async () => {
    const { services, child } = await renderGame((onDone) => (
      <MatchingGame trials={5} onDone={onDone} />
    ));
    fireEvent.press(screen.getByTestId('choice-correct'));
    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await services.repository.listTrials(child.id)).toHaveLength(1),
    );
    await nextTrial();
    expect(await services.repository.listTrials(child.id)).toHaveLength(1);
  });
});

describe('SortingGame', () => {
  it('names the right group as the first hint and records a correct placement', async () => {
    const { services, child } = await renderGame(
      (onDone) => (
        <SortingGame skill={SKILLS['sort-color']} trials={5} onDone={onDone} />
      ),
      async (prepared, profile) => {
        const sessionId = prepared.newId();
        await prepared.repository.saveSession({
          id: sessionId,
          childId: profile.id,
          startedAt: '2026-10-18T08:00:00.000Z',
          endedAt: null,
          activitiesCompleted: 0,
          calmVisits: 0,
        });
        await prepared.repository.recordTrial(
          {
            childId: profile.id,
            sessionId,
            skillId: 'sort-color',
            level: 1,
            promptLevel: 'independent',
            firstTryCorrect: true,
            wrongAttempts: 0,
            escalatedToGuide: false,
            responseMs: 500,
            at: '2026-10-18T08:05:00.000Z',
          },
          { ...createSkillProgress('sort-color'), promptLevel: 'independent' },
        );
      },
    );
    expect(services.speech.texts()).toContain('لنضع الشكل مع لونه');
    const correctLabel = screen.getByTestId('choice-correct').props
      .accessibilityLabel as string;
    fireEvent.press(screen.getAllByTestId(/^choice-other-/)[0]!);
    expect(services.speech.last()).toBe(correctLabel);
    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await services.repository.listTrials(child.id)).toHaveLength(2),
    );
    expect((await services.repository.listTrials(child.id))[1]).toMatchObject({
      skillId: 'sort-color',
      wrongAttempts: 1,
      firstTryCorrect: false,
    });
  });
});

describe('CauseEffectGame', () => {
  it('names the touched shape as its effect', async () => {
    const { services, child } = await renderGame((onDone) => (
      <CauseEffectGame trials={6} onDone={onDone} />
    ));
    fireEvent(screen.getByTestId('cause-effect-background').parent!, 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 800, height: 600 } },
    });
    const target = await screen.findByTestId('choice-correct');
    const label = target.props.accessibilityLabel as string;
    fireEvent.press(target);
    await waitFor(async () =>
      expect(await services.repository.listTrials(child.id)).toHaveLength(1),
    );
    expect(services.speech.last()).toBe(label);
    const named = SHAPES.flatMap((shape) =>
      PIECE_COLORS.map(
        (color) => describePiece({ shape, color, size: 'medium' }).text,
      ),
    );
    expect(named).toContain(label);
  });

  it('treats background touches as a cue for more help', async () => {
    const { services } = await renderGame((onDone) => (
      <CauseEffectGame trials={6} onDone={onDone} />
    ));
    services.speech.spoken.length = 0;
    fireEvent.press(screen.getByTestId('cause-effect-background'));
    fireEvent.press(screen.getByTestId('cause-effect-background'));
    expect(services.speech.texts()).toEqual(['لننظر هنا', 'لننظر هنا']);
  });
});
