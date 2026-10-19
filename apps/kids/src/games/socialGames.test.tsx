import { emotionName, greetingWords } from '@luminol/kids-content';
import {
  createEmotionRound,
  createRandom,
  createSituationRound,
  createSkillProgress,
  levelSpec,
  situationScene,
  type Random,
  EMOTIONS,
  GREETINGS,
  SKILLS,
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
import { EmotionGame } from './EmotionGame';
import { GreetingGame } from './GreetingGame';
import { FIRST_TURN_MS, TURN_MS, TurnGame } from './TurnGame';

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
  options: { independent?: SkillId; seed?: number } = {},
) {
  const services = await createTestServices(options.seed ?? 34);
  const child = await addChild(services);
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

/** Trials recorded by the game, not the one set up by `makeIndependent`. */
async function gameTrials(services: TestServices, child: ChildProfile) {
  return (await services.repository.listTrials(child.id)).filter(
    (trial) => trial.at !== '2026-10-18T08:05:00.000Z',
  );
}

async function trialCount(services: TestServices, child: ChildProfile) {
  return (await gameTrials(services, child)).length;
}

const FEELING_WORDS = EMOTIONS.map((emotion) => emotionName(emotion).text);

describe('EmotionGame', () => {
  it('asks for a face and records the chosen feeling', async () => {
    const { services, child } = await renderGame((onDone) => (
      <EmotionGame skill={SKILLS['emotion-find']} trials={5} onDone={onDone} />
    ));
    expect(services.speech.texts()).toContain('لننظر إلى الوجوه');
    await waitFor(() =>
      expect(services.speech.last()).toMatch(
        /^لننظر إلى الوجوه أين الوجه .+؟$/,
      ),
    );
    expect(screen.getAllByTestId(/^picture-/).length).toBeGreaterThanOrEqual(2);
    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await trialCount(services, child)).toBe(1),
    );
  });

  it('names the feeling as the first hint', async () => {
    const { services } = await renderGame(
      (onDone) => (
        <EmotionGame
          skill={SKILLS['emotion-find']}
          trials={5}
          onDone={onDone}
        />
      ),
      { independent: 'emotion-find' },
    );
    const correct = screen.getByTestId('choice-correct').props
      .accessibilityLabel as string;
    fireEvent.press(screen.getAllByTestId(/^choice-other-/)[0]!);
    expect(services.speech.last()).toBe(correct);
    expect(FEELING_WORDS).toContain(correct);
  });

  it('tells a story about Sami and asks how he feels', async () => {
    const { services } = await renderGame((onDone) => (
      <EmotionGame
        skill={SKILLS['emotion-situation']}
        trials={4}
        onDone={onDone}
      />
    ));
    await waitFor(() =>
      expect(services.speech.last()).toMatch(
        /^لنستمع إلى القصة .*سامي.*\. كيف يشعر سامي؟$/,
      ),
    );
    const story = services.speech.last()!.replace('لنستمع إلى القصة ', '');
    fireEvent.press(screen.getByTestId('emotion-replay'));
    expect(services.speech.last()).toBe(story);
  });
});

/** The first seed whose opening round satisfies `test`. */
function seedWhere(test: (random: Random) => boolean): number {
  const seed = Array.from({ length: 200 }, (_, index) => index + 1).find(
    (candidate) => test(createRandom(candidate)),
  );
  if (seed === undefined) throw new Error('No seed found.');
  return seed;
}

describe('EmotionGame faces and scenes', () => {
  it("names a girl's faces with the feminine words", async () => {
    const seed = seedWhere(
      (random) =>
        createEmotionRound(levelSpec(SKILLS['emotion-find'], 1), random)
          .character === 'girl',
    );
    await renderGame(
      (onDone) => (
        <EmotionGame
          skill={SKILLS['emotion-find']}
          trials={5}
          onDone={onDone}
        />
      ),
      { seed },
    );
    const pictures = screen.getAllByTestId(/^picture-/);
    expect(pictures.length).toBeGreaterThanOrEqual(2);
    for (const picture of pictures) {
      expect(picture.props.testID).toMatch(/-girl$/);
    }
    const label = screen.getByTestId('choice-correct').props
      .accessibilityLabel as string;
    expect(label).toMatch(/ة$/);
  });

  it('shows the scene of a story that has one', async () => {
    const seed = seedWhere((random) => {
      const round = createSituationRound(
        levelSpec(SKILLS['emotion-situation'], 1),
        random,
      );
      return situationScene(round.target) === 'sami-barking-dog';
    });
    await renderGame(
      (onDone) => (
        <EmotionGame
          skill={SKILLS['emotion-situation']}
          trials={4}
          onDone={onDone}
        />
      ),
      { seed },
    );
    expect(screen.getByTestId('scene-sami-barking-dog')).toBeTruthy();
    expect(screen.getByText(/نبح كلب كبير/)).toBeTruthy();
  });
});

describe('GreetingGame', () => {
  it('reads the moment, the question and every choice', async () => {
    const { services, child } = await renderGame((onDone) => (
      <GreetingGame trials={4} onDone={onDone} />
    ));
    const choices = [
      screen.getByTestId('choice-correct'),
      ...screen.getAllByTestId(/^choice-other-/),
    ].map((tile) => tile.props.accessibilityLabel as string);
    await waitFor(() => expect(services.speech.last()).toContain('ماذا نقول؟'));
    const spoken = services.speech.last()!;
    for (const words of choices) expect(spoken).toContain(words);
    fireEvent.press(screen.getByTestId('choice-correct'));
    await waitFor(async () =>
      expect(await trialCount(services, child)).toBe(1),
    );
  });

  it('says the right words as the first hint', async () => {
    const { services } = await renderGame(
      (onDone) => <GreetingGame trials={4} onDone={onDone} />,
      { independent: 'greetings' },
    );
    const correct = screen.getByTestId('choice-correct').props
      .accessibilityLabel as string;
    fireEvent.press(screen.getAllByTestId(/^choice-other-/)[0]!);
    expect(services.speech.last()).toBe(correct);
    expect(GREETINGS.map((id) => greetingWords(id).text)).toContain(correct);
  });
});

describe('TurnGame', () => {
  function advance(ms: number) {
    act(() => {
      jest.advanceTimersByTime(ms);
    });
  }

  it('waits for the app to build, then records the child turn', async () => {
    const { services, child } = await renderGame((onDone) => (
      <TurnGame trials={5} onDone={onDone} />
    ));
    expect(screen.getByTestId('turn-app')).toBeTruthy();
    advance(FIRST_TURN_MS);
    expect(services.speech.last()).toBe('دوري');
    advance(TURN_MS);
    expect(services.speech.last()).toBe('دورك');
    expect(screen.getByTestId('turn-child')).toBeTruthy();
    fireEvent.press(screen.getByTestId('turn-add'));
    await waitFor(async () =>
      expect(await trialCount(services, child)).toBe(1),
    );
    expect((await services.repository.listTrials(child.id))[0]).toMatchObject({
      skillId: 'turn-taking',
      firstTryCorrect: true,
    });
  });

  it("reminds the child to wait when touched during the app's turn", async () => {
    const { services, child } = await renderGame(
      (onDone) => <TurnGame trials={5} onDone={onDone} />,
      { independent: 'turn-taking' },
    );
    fireEvent.press(screen.getByTestId('turn-add'));
    expect(services.speech.last()).toBe('لننتظر دورنا');
    advance(FIRST_TURN_MS + TURN_MS);
    fireEvent.press(screen.getByTestId('turn-add'));
    await waitFor(async () =>
      expect(await trialCount(services, child)).toBe(1),
    );
    expect((await gameTrials(services, child))[0]).toMatchObject({
      firstTryCorrect: false,
      wrongAttempts: 1,
    });
  });

  it('rests the button during the app turn while help is full', async () => {
    await renderGame((onDone) => <TurnGame trials={5} onDone={onDone} />);
    expect(
      screen.getByTestId('turn-add').props.accessibilityState,
    ).toMatchObject({ disabled: true });
    advance(FIRST_TURN_MS + TURN_MS);
    expect(
      screen.getByTestId('turn-add').props.accessibilityState,
    ).toMatchObject({ disabled: false });
  });
});
