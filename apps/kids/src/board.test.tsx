import {
  EMPTY_AAC_BOARD,
  MAX_SENTENCE_LENGTH,
  setOverride,
  upsertCustomCard,
  type AacBoard,
} from '@luminol/kids-learning';
import { router } from 'expo-router';
import {
  act,
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from 'expo-router/testing-library';

import { createServices } from './services/createServices';
import { APP_ROUTES } from './test/routes';
import {
  addChild,
  createTestServices,
  type TestServices,
} from './test/support';

jest.mock('./services/createServices', () => ({ createServices: jest.fn() }));

type Setup = { services: TestServices; childId: string };

async function start(board?: (childId: string) => AacBoard): Promise<Setup> {
  const services = await createTestServices(5);
  const child = await addChild(services);
  if (board) {
    await services.repository.saveBoard(
      child.id,
      board(child.id),
      services.now(),
    );
  }
  jest.mocked(createServices).mockResolvedValue(services);
  renderRouter(APP_ROUTES, { initialUrl: '/' });
  return { services, childId: child.id };
}

async function openBoard({ childId }: Setup) {
  fireEvent.press(await screen.findByTestId(`child-${childId}`));
  fireEvent.press(await screen.findByTestId('nav-talk'));
  await screen.findByTestId('sentence-strip');
}

async function openEditor({ childId }: Setup) {
  fireEvent.press(await screen.findByTestId('open-parent'));
  fireEvent.press(await screen.findByTestId('gate-answer'));
  fireEvent.press(await screen.findByTestId(`edit-${childId}`));
  fireEvent.press(await screen.findByTestId('profile-board'));
  await screen.findByTestId('board-add-card');
}

const photoPath = (childId: string, n: number) =>
  `children/${childId}/aac/00000000-0000-4000-8000-${String(900 + n).padStart(12, '0')}.jpg`;

describe('communication board for the child', () => {
  it('builds a sentence from pictures and reads it aloud', async () => {
    const setup = await start();
    const { services } = setup;
    await openBoard(setup);

    fireEvent.press(screen.getByTestId('card-want'));
    expect(services.speech.last()).toBe('أريد');
    fireEvent.press(screen.getByTestId('category-needs'));
    expect(services.speech.last()).toBe('حاجاتي');
    fireEvent.press(screen.getByTestId('card-water'));

    expect(screen.getByTestId('sentence-word-want')).toBeTruthy();
    expect(screen.getByTestId('sentence-word-water')).toBeTruthy();
    fireEvent.press(screen.getByTestId('sentence-speak'));
    expect(services.speech.last()).toBe('أريد ماء');
    expect(services.speech.spoken.at(-1)?.items).toHaveLength(2);

    fireEvent.press(screen.getByTestId('sentence-remove'));
    expect(screen.queryByTestId('sentence-word-water')).toBeNull();
    fireEvent.press(screen.getByTestId('sentence-clear'));
    expect(screen.getByText('لنختر صورة')).toBeTruthy();
    expect(
      screen.getByTestId('sentence-speak').props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it('stops adding words once the sentence is full', async () => {
    const setup = await start();
    await openBoard(setup);
    for (let index = 0; index < MAX_SENTENCE_LENGTH + 2; index += 1) {
      fireEvent.press(screen.getByTestId('card-more'));
    }
    expect(screen.getAllByTestId('sentence-word-more')).toHaveLength(
      MAX_SENTENCE_LENGTH,
    );
  });

  it('hides cards the parent hid and uses the parent voice and photo', async () => {
    const setup = await start((childId) =>
      upsertCustomCard(
        setOverride(
          setOverride(EMPTY_AAC_BOARD, 'milk', {
            hidden: true,
            picture: null,
            voicePath: null,
          }),
          'mother',
          {
            hidden: false,
            picture: { kind: 'builtin', id: 'mother-2' },
            voicePath: photoPath(childId, 1).replace('.jpg', '.m4a'),
          },
        ),
        {
          id: '00000000-0000-4000-8000-000000000777',
          label: 'جدّتي',
          category: 'people',
          photoPath: photoPath(childId, 2),
          voicePath: null,
          hidden: false,
        },
      ),
    );
    await openBoard(setup);

    fireEvent.press(screen.getByTestId('category-food'));
    expect(screen.queryByTestId('card-milk')).toBeNull();
    expect(screen.getByTestId('card-juice')).toBeTruthy();

    fireEvent.press(screen.getByTestId('category-people'));
    expect(screen.getByTestId('picture-mother-2')).toBeTruthy();
    fireEvent.press(screen.getByTestId('card-mother'));
    expect(setup.services.speech.spoken.at(-1)?.items[0]?.recordingUri).toBe(
      `file:///documents/${photoPath(setup.childId, 1).replace('.jpg', '.m4a')}`,
    );
    fireEvent.press(
      screen.getByTestId('card-00000000-0000-4000-8000-000000000777'),
    );
    expect(setup.services.speech.last()).toBe('جدّتي');
  });

  it('is reachable from every child screen', async () => {
    const setup = await start();
    await openBoard(setup);
    fireEvent.press(screen.getByTestId('nav-calm'));
    expect(await screen.findByTestId('calm-breath')).toBeTruthy();
    fireEvent.press(screen.getByTestId('nav-talk'));
    expect(await screen.findByTestId('sentence-strip')).toBeTruthy();
  });
});

describe('communication board editor for parents', () => {
  it('hides and shows a card for one child', async () => {
    const setup = await start();
    await openEditor(setup);
    fireEvent.press(screen.getByTestId('board-toggle-milk'));
    await waitFor(async () =>
      expect(
        (await setup.services.repository.getBoard(setup.childId)).overrides.milk
          ?.hidden,
      ).toBe(true),
    );
    fireEvent.press(await screen.findByTestId('board-toggle-milk'));
    await waitFor(async () =>
      expect(
        (await setup.services.repository.getBoard(setup.childId)).overrides,
      ).toEqual({}),
    );
  });

  it('records a parent voice and picks the second mother picture', async () => {
    const setup = await start();
    await openEditor(setup);
    fireEvent.press(screen.getByTestId('board-edit-mother'));
    fireEvent.press(await screen.findByTestId('card-picture-mother-2'));
    fireEvent.press(screen.getByTestId('card-record'));
    fireEvent.press(await screen.findByTestId('card-stop'));
    await waitFor(() =>
      expect(screen.getByTestId('card-voice-state').props.children).toBe(
        'صوتي المسجّل',
      ),
    );
    fireEvent.press(screen.getByTestId('card-save'));

    await waitFor(async () => {
      const board = await setup.services.repository.getBoard(setup.childId);
      expect(board.overrides.mother?.picture).toEqual({
        kind: 'builtin',
        id: 'mother-2',
      });
      expect(board.overrides.mother?.voicePath).toMatch(/\.m4a$/);
    });
    expect(setup.services.media.files.size).toBe(1);
    expect(await screen.findByTestId('board-add-card')).toBeTruthy();
  });

  it('adds a parent card with a word, group and photo', async () => {
    const setup = await start();
    await openEditor(setup);
    fireEvent.press(screen.getByTestId('board-add-card'));

    fireEvent.press(await screen.findByTestId('card-save'));
    expect(await screen.findByText(/اكتب كلمة قصيرة/)).toBeTruthy();
    fireEvent.changeText(screen.getByTestId('card-label'), ' جدّتي ');
    fireEvent.press(screen.getByTestId('card-save'));
    expect(await screen.findByTestId('card-problem')).toBeTruthy();

    fireEvent.press(screen.getByTestId('card-category-people'));
    fireEvent.press(screen.getByTestId('card-choose-photo'));
    await waitFor(() => expect(setup.services.media.files.size).toBe(1));
    fireEvent.press(screen.getByTestId('card-save'));

    await waitFor(async () => {
      const board = await setup.services.repository.getBoard(setup.childId);
      expect(board.customCards).toHaveLength(1);
      expect(board.customCards[0]).toMatchObject({
        label: 'جدّتي',
        category: 'people',
      });
    });
  });

  it('deletes new files when the parent cancels', async () => {
    const setup = await start();
    await openEditor(setup);
    fireEvent.press(screen.getByTestId('board-edit-water'));
    fireEvent.press(await screen.findByTestId('card-take-photo'));
    await waitFor(() => expect(setup.services.media.files.size).toBe(1));
    const [photo] = [...setup.services.media.files];
    fireEvent.press(screen.getByText('إلغاء'));
    await screen.findByTestId('board-add-card');
    expect(setup.services.media.removed).toContain(photo);
    expect(
      (await setup.services.repository.getBoard(setup.childId)).overrides,
    ).toEqual({});
  });

  it('deletes the old photo when a new one replaces it', async () => {
    const setup = await start((childId) =>
      setOverride(EMPTY_AAC_BOARD, 'water', {
        hidden: false,
        picture: { kind: 'photo', path: photoPath(childId, 3) },
        voicePath: null,
      }),
    );
    await openEditor(setup);
    fireEvent.press(screen.getByTestId('board-edit-water'));
    fireEvent.press(await screen.findByTestId('card-choose-photo'));
    await waitFor(() => expect(setup.services.media.files.size).toBe(1));
    fireEvent.press(screen.getByTestId('card-save'));
    await waitFor(() =>
      expect(setup.services.media.removed).toContain(
        photoPath(setup.childId, 3),
      ),
    );
  });

  it('explains when camera access was refused', async () => {
    const setup = await start();
    setup.services.media.nextPhoto = 'denied';
    await openEditor(setup);
    fireEvent.press(screen.getByTestId('board-edit-water'));
    fireEvent.press(await screen.findByTestId('card-take-photo'));
    expect(await screen.findByText(/لم يُسمح بالوصول/)).toBeTruthy();
  });

  it('removes a parent card and its photo', async () => {
    const cardId = '00000000-0000-4000-8000-000000000777';
    const setup = await start((childId) =>
      upsertCustomCard(EMPTY_AAC_BOARD, {
        id: cardId,
        label: 'جدّتي',
        category: 'people',
        photoPath: photoPath(childId, 4),
        voicePath: null,
        hidden: false,
      }),
    );
    await openEditor(setup);
    fireEvent.press(screen.getByTestId(`board-edit-${cardId}`));
    fireEvent.press(await screen.findByTestId('card-delete'));
    await waitFor(async () =>
      expect(
        (await setup.services.repository.getBoard(setup.childId)).customCards,
      ).toEqual([]),
    );
    expect(setup.services.media.removed).toContain(photoPath(setup.childId, 4));
  });

  it('deletes all of a child’s photos and recordings with their profile', async () => {
    const setup = await start();
    await openEditor(setup);
    act(() => router.back());
    fireEvent.press(await screen.findByTestId('profile-delete'));
    fireEvent.press(await screen.findByTestId('profile-delete-confirm'));
    await waitFor(() =>
      expect(setup.services.media.removedChildren).toEqual([setup.childId]),
    );
  });
});
