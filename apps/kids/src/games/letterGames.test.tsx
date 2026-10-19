import {
  createSkillProgress,
  LETTER_CHARS,
  LETTER_IDS,
  letterTrace,
  SKILLS,
  type ChildProfile,
  type LetterId,
  type SkillId,
} from '@luminol/kids-learning';
import {
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
import { CountGame } from './CountGame';
import { LetterGame } from './LetterGame';
import { TraceGame } from './TraceGame';

jest.useFakeTimers();

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
  options: { independent?: SkillId; child?: Partial<ChildProfile> } = {},
) {
  const services = await createTestServices(21);
  const child = await addChild(services, options.child);
  if (options.independent) {
    await makeIndependent(services, child, options.independent);
  }
  render(
    <WithChild services={services} profiles={[child]} childId={child.id}>
      {element(jest.fn())}
    </WithChild>,
  );
  await screen.findByTestId('game-instruction');
  return { services, child };
}

async function trialCount(services: TestServices, child: ChildProfile) {
  return (await services.repository.listTrials(child.id)).length;
}

describe('LetterGame', () => {
  it('matches a letter and records the trial', async () => {
    const { services, child } = await renderGame((onDone) => (
      <LetterGame skill={SKILLS['letter-match']} trials={5} onDone={onDone} />
    ));
    expect(services.speech.texts()).toContain('لنبحث عن الحرف نفسه');
    expect(screen.getByTestId('letter-target')).toBeTruthy();
    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await trialCount(services, child)).toBe(1),
    );
  });

  it('names the target letter as the first hint', async () => {
    const { services } = await renderGame(
      (onDone) => (
        <LetterGame skill={SKILLS['letter-match']} trials={5} onDone={onDone} />
      ),
      { independent: 'letter-match' },
    );
    const name = screen.getByTestId('letter-target').props
      .accessibilityLabel as string;
    fireEvent.press(screen.getAllByTestId(/^choice-other-/)[0]!);
    expect(services.speech.last()).toBe(name);
  });

  it('asks with the letter sound, which can be heard again', async () => {
    const { services } = await renderGame((onDone) => (
      <LetterGame skill={SKILLS['letter-sound']} trials={5} onDone={onDone} />
    ));
    await waitFor(() =>
      expect(services.speech.last()).toMatch(/^لنجد الحرف [؀-ۿ]َ$/),
    );
    expect(screen.queryByTestId('letter-target')).toBeNull();
    const sound = services.speech.last()!.split(' ').at(-1);
    fireEvent.press(screen.getByTestId('letter-replay'));
    expect(services.speech.last()).toBe(sound);
  });

  it('shows connected forms in the forms game', async () => {
    await renderGame((onDone) => (
      <LetterGame skill={SKILLS['letter-forms']} trials={5} onDone={onDone} />
    ));
    expect(screen.getAllByText(/‍/).length).toBeGreaterThan(0);
  });
});

describe('TraceGame', () => {
  function shownLetter(): LetterId {
    const text = screen.getByTestId('trace-letter').props.children as string;
    const id = LETTER_IDS.find((candidate) => LETTER_CHARS[candidate] === text);
    if (!id) throw new Error(`Unknown letter ${text}`);
    return id;
  }

  function touchAt(x: number, y: number, kind = 'responderMove') {
    fireEvent(screen.getByTestId('trace-canvas'), kind, {
      nativeEvent: { locationX: (x / 100) * 300, locationY: (y / 100) * 300 },
    });
  }

  it('records a letter traced along its strokes', async () => {
    const { services, child } = await renderGame((onDone) => (
      <TraceGame trials={3} onDone={onDone} />
    ));
    const id = shownLetter();
    expect(services.speech.last()).toMatch(/^لنكتب الحرف مع النقاط /);
    for (const stroke of letterTrace(id).checkpoints) {
      stroke.forEach((point, index) =>
        touchAt(
          point.x,
          point.y,
          index === 0 ? 'responderGrant' : 'responderMove',
        ),
      );
      fireEvent(screen.getByTestId('trace-canvas'), 'responderRelease');
    }
    await waitFor(async () =>
      expect(await trialCount(services, child)).toBe(1),
    );
    expect((await services.repository.listTrials(child.id))[0]).toMatchObject({
      skillId: 'letter-trace',
      firstTryCorrect: true,
    });
  });

  it('brings help closer when the finger wanders off the letter', async () => {
    const { services } = await renderGame(
      (onDone) => <TraceGame trials={3} onDone={onDone} />,
      { independent: 'letter-trace' },
    );
    const name = screen.getByTestId('trace-canvas').props
      .accessibilityLabel as string;
    touchAt(2, 98, 'responderGrant');
    expect(services.speech.last()).toBe(name);
  });
});

describe('CountGame', () => {
  it('counts pictures aloud as they are touched', async () => {
    const { services, child } = await renderGame((onDone) => (
      <CountGame trials={5} theme="food" onDone={onDone} />
    ));
    expect(services.speech.texts()).toContain('لنعدّ الصور');
    const items = screen.getAllByTestId(/^count-item-/);
    expect(items.length).toBeGreaterThanOrEqual(1);
    fireEvent.press(items[0]!);
    expect(services.speech.last()).toBe('واحد');
    fireEvent.press(items[0]!);
    expect(services.speech.last()).toBe('واحد');
    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await trialCount(services, child)).toBe(1),
    );
  });

  it('shows Arabic-Indic digits when the parent chose them', async () => {
    await renderGame(
      (onDone) => <CountGame trials={5} theme="shapes" onDone={onDone} />,
      { child: { numeralStyle: 'arabic-indic' } },
    );
    expect(screen.getAllByText(/^[١٢٣]$/).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/^[0-9]+$/)).toHaveLength(0);
  });
});
