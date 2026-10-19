import {
  createSkillProgress,
  type ChildProfile,
  type SkillId,
} from '@luminol/kids-learning';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { ReactElement } from 'react';

import {
  addChild,
  createTestServices,
  WithChild,
  type TestServices,
} from '../test/support';
import { MatchingGame } from './MatchingGame';
import { MemoryGame, PEEK_MS } from './MemoryGame';
import { PatternGame } from './PatternGame';
import { PuzzleGame } from './PuzzleGame';
import { CELEBRATE_MS } from './useTrialFlow';

jest.useFakeTimers();

/** Starts the child at independent help so wrong answers can be tested. */
async function makeIndependent(
  services: TestServices,
  child: ChildProfile,
  skillId: SkillId,
) {
  const sessionId = services.newId();
  await services.repository.saveSession({
    id: sessionId,
    childId: child.id,
    startedAt: '2026-10-18T08:00:00.000Z',
    endedAt: null,
    activitiesCompleted: 0,
    calmVisits: 0,
  });
  await services.repository.recordTrial(
    {
      childId: child.id,
      sessionId,
      skillId,
      level: 1,
      promptLevel: 'independent',
      firstTryCorrect: true,
      wrongAttempts: 0,
      escalatedToGuide: false,
      responseMs: 500,
      at: '2026-10-18T08:05:00.000Z',
    },
    { ...createSkillProgress(skillId), promptLevel: 'independent' },
  );
}

async function renderGame(
  element: (onDone: () => void) => ReactElement,
  independent?: SkillId,
) {
  const services = await createTestServices(11);
  const child = await addChild(services);
  if (independent) await makeIndependent(services, child, independent);
  const onDone = jest.fn();
  render(
    <WithChild services={services} profiles={[child]} childId={child.id}>
      {element(onDone)}
    </WithChild>,
  );
  await screen.findByTestId('game-instruction');
  return { services, child, onDone };
}

function isDisabled(testId: string): boolean {
  return screen.getByTestId(testId).props.accessibilityState?.disabled === true;
}

describe('MatchingGame with a picture theme', () => {
  it('shows theme pictures and asks for the same picture', async () => {
    const { services } = await renderGame((onDone) => (
      <MatchingGame trials={5} theme="food" onDone={onDone} />
    ));
    expect(services.speech.texts()).toContain('لنبحث عن الصورة نفسها');
    expect(screen.getAllByTestId(/^picture-/).length).toBeGreaterThan(1);
    expect(screen.queryAllByTestId(/^shape-/)).toHaveLength(0);
  });
});

describe('PatternGame', () => {
  it('fills the gap with the answer and records the trial', async () => {
    const { services, child } = await renderGame((onDone) => (
      <PatternGame trials={5} theme="things" onDone={onDone} />
    ));
    expect(services.speech.texts()).toContain('ماذا يأتي بعد ذلك؟');
    expect(screen.getByText('؟')).toBeTruthy();
    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await services.repository.listTrials(child.id)).toHaveLength(1),
    );
    expect(screen.queryByText('؟')).toBeNull();
    expect((await services.repository.listTrials(child.id))[0]).toMatchObject({
      skillId: 'pattern-next',
    });
  });

  it('names the answer as the first hint after a wrong choice', async () => {
    const { services } = await renderGame(
      (onDone) => <PatternGame trials={5} theme="shapes" onDone={onDone} />,
      'pattern-next',
    );
    const answer = screen.getByTestId('choice-correct').props
      .accessibilityLabel as string;
    fireEvent.press(screen.getAllByTestId(/^choice-other-/)[0]!);
    expect(services.speech.last()).toBe(answer);
  });
});

describe('PuzzleGame', () => {
  it('completes the picture with the missing piece', async () => {
    const { services, child } = await renderGame((onDone) => (
      <PuzzleGame trials={5} theme="food" onDone={onDone} />
    ));
    expect(services.speech.texts()).toContain('لنكمل الصورة');
    expect(screen.getByTestId('puzzle-gap')).toBeTruthy();
    // New skills start errorless: only the right piece can be pressed.
    for (const other of screen.getAllByTestId(/^choice-other-/)) {
      expect(isDisabled(other.props.testID as string)).toBe(true);
    }
    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await services.repository.listTrials(child.id)).toHaveLength(1),
    );
    expect(screen.queryByTestId('puzzle-gap')).toBeNull();
  });
});

describe('MemoryGame', () => {
  function cardIds(): string[] {
    return screen
      .getAllByTestId(/^memory-card-/)
      .map((card) => String(card.props.testID).replace('memory-card-', ''));
  }

  function pairOf(id: string): string {
    const [index, side] = id.split('-');
    return `${index}-${side === 'a' ? 'b' : 'a'}`;
  }

  it('turns a card, then records a found pair as a trial', async () => {
    const { services, child } = await renderGame((onDone) => (
      <MemoryGame trials={6} theme="food" onDone={onDone} />
    ));
    const ids = cardIds();
    expect(ids).toHaveLength(4);
    expect(screen.getAllByLabelText('بطاقة مقلوبة')).toHaveLength(4);

    const first = ids[0]!;
    fireEvent.press(screen.getByTestId(`memory-card-${first}`));
    expect(screen.getAllByLabelText('بطاقة مقلوبة')).toHaveLength(3);
    // New skills start errorless: once a card is open, only its partner is pressable.
    for (const id of ids) {
      if (id === first || id === pairOf(first)) continue;
      expect(isDisabled(`memory-card-${id}`)).toBe(true);
    }
    fireEvent.press(screen.getByTestId(`memory-card-${pairOf(first)}`));
    await waitFor(async () =>
      expect(await services.repository.listTrials(child.id)).toHaveLength(1),
    );
    expect(screen.getAllByLabelText('بطاقة مقلوبة')).toHaveLength(2);
  });

  it('turns a wrong partner back and brings help closer', async () => {
    const { services, child } = await renderGame(
      (onDone) => <MemoryGame trials={6} theme="shapes" onDone={onDone} />,
      'memory-pairs',
    );
    const ids = cardIds();
    const first = ids[0]!;
    const wrong = ids.find((id) => id !== first && id !== pairOf(first))!;
    fireEvent.press(screen.getByTestId(`memory-card-${first}`));
    const openLabel = services.speech.last();

    fireEvent.press(screen.getByTestId(`memory-card-${wrong}`));
    expect(services.speech.last()).toBe(openLabel);
    expect(screen.getAllByLabelText('بطاقة مقلوبة')).toHaveLength(2);
    await act(async () => {
      jest.advanceTimersByTime(PEEK_MS);
    });
    expect(screen.getAllByLabelText('بطاقة مقلوبة')).toHaveLength(3);

    fireEvent.press(screen.getByTestId(`memory-card-${pairOf(first)}`));
    await waitFor(async () =>
      expect(await services.repository.listTrials(child.id)).toHaveLength(2),
    );
    expect((await services.repository.listTrials(child.id))[1]).toMatchObject({
      skillId: 'memory-pairs',
      firstTryCorrect: false,
      wrongAttempts: 1,
    });
  });

  it('deals a new board once every pair is found', async () => {
    const { onDone } = await renderGame((done) => (
      <MemoryGame trials={3} theme="things" onDone={done} />
    ));
    for (let trial = 0; trial < 3; trial += 1) {
      const ids = cardIds().filter(
        (id) =>
          screen.getByTestId(`memory-card-${id}`).props.accessibilityLabel ===
          'بطاقة مقلوبة',
      );
      const first = ids[0]!;
      fireEvent.press(screen.getByTestId(`memory-card-${first}`));
      fireEvent.press(screen.getByTestId(`memory-card-${pairOf(first)}`));
      await act(async () => {
        jest.advanceTimersByTime(CELEBRATE_MS);
      });
      if (trial === 1) {
        // The two-pair board was cleared, so a fresh board is face down.
        expect(screen.getAllByLabelText('بطاقة مقلوبة')).toHaveLength(4);
      }
    }
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });
});
