import type { ChildProfile, ChildSequences } from '@luminol/kids-learning';
import {
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

type Setup = { services: TestServices; child: ChildProfile };

async function start(
  options: {
    child?: Partial<ChildProfile>;
    sequences?: (childId: string, newId: () => string) => ChildSequences;
  } = {},
): Promise<Setup> {
  const services = await createTestServices(6);
  const child = await addChild(services, options.child);
  if (options.sequences) {
    await services.repository.saveSequences(
      child.id,
      options.sequences(child.id, services.newId),
      services.now(),
    );
  }
  jest.mocked(createServices).mockResolvedValue(services);
  renderRouter(APP_ROUTES, { initialUrl: '/' });
  return { services, child };
}

async function openStories({ child }: Setup) {
  fireEvent.press(await screen.findByTestId(`child-${child.id}`));
  fireEvent.press(await screen.findByTestId('nav-stories'));
  await screen.findByText('قصص');
}

async function openSequenceEditor({ child }: Setup) {
  fireEvent.press(await screen.findByTestId('open-parent'));
  fireEvent.press(await screen.findByTestId('gate-answer'));
  fireEvent.press(await screen.findByTestId(`edit-${child.id}`));
  fireEvent.press(await screen.findByTestId('profile-sequences'));
  await screen.findByTestId('sequence-add-routine');
}

describe('stories for the child', () => {
  it('reads a built-in story page by page', async () => {
    const setup = await start();
    const { services } = setup;
    await openStories(setup);
    expect(screen.queryByTestId('open-ramadan')).toBeNull();

    fireEvent.press(screen.getByTestId('open-angry'));
    expect(services.speech.last()).toBe('عندما أغضب');
    await waitFor(() =>
      expect(services.speech.last()).toBe(
        'عندما أغضب أحيانًا أشعر بالغضب، وكلّ الناس يغضبون أحيانًا.',
      ),
    );
    expect(screen.getByTestId('picture-angry')).toBeTruthy();

    for (let page = 1; page < 5; page += 1) {
      fireEvent.press(screen.getByTestId('story-next'));
    }
    expect(services.speech.last()).toBe(
      'بعد قليل يهدأ جسمي، وأشعر بتحسّن. انتهت القصة',
    );
    expect(screen.queryByTestId('story-next')).toBeNull();
    fireEvent.press(screen.getByTestId('story-previous'));
    expect(services.speech.last()).toBe('أستطيع أن أطلب عناقًا من شخص أحبّه.');
  });

  it('shows the Ramadan and Eid stories when the religious pack is on', async () => {
    const setup = await start({ child: { religiousPack: true } });
    await openStories(setup);
    expect(screen.getByTestId('open-eid')).toBeTruthy();
    fireEvent.press(screen.getByTestId('open-ramadan'));
    expect(await screen.findByTestId('picture-crescent')).toBeTruthy();
    expect(screen.getByTestId('story-text').props.accessibilityLabel).toBe(
      'عندما يظهر الهلال، يبدأ شهر رمضان.',
    );
  });

  it('follows a routine step by step', async () => {
    let routineId = '';
    const setup = await start({
      sequences: (_, newId) => {
        routineId = newId();
        return {
          items: [
            {
              id: routineId,
              kind: 'routine',
              title: 'الصباح',
              steps: [
                {
                  id: newId(),
                  text: 'أذهب إلى الحمّام',
                  picture: { kind: 'builtin', id: 'toilet' },
                  voicePath: null,
                },
                {
                  id: newId(),
                  text: 'أتناول الفطور',
                  picture: { kind: 'builtin', id: 'food' },
                  voicePath: null,
                },
              ],
            },
          ],
        };
      },
    });
    const { services } = setup;
    await openStories(setup);
    expect(screen.getByText('روتيني')).toBeTruthy();
    fireEvent.press(screen.getByTestId(`open-${routineId}`));
    await waitFor(() =>
      expect(services.speech.last()).toBe('الصباح أذهب إلى الحمّام'),
    );
    fireEvent.press(screen.getByTestId('routine-done'));
    expect(services.speech.last()).toBe('أتناول الفطور');
    expect(
      screen.getByTestId('routine-step-0').props.accessibilityState,
    ).toMatchObject({ checked: true });
    fireEvent.press(screen.getByTestId('routine-done'));
    expect(services.speech.last()).toBe('أحسنت! انتهى الروتين');
    expect(screen.getByTestId('routine-all-done')).toBeTruthy();
  });

  it("plays a parent's recorded voice for a story page", async () => {
    let storyId = '';
    let voicePath = '';
    const setup = await start({
      sequences: (childId, newId) => {
        storyId = newId();
        voicePath = `children/${childId}/aac/${newId()}.m4a`;
        return {
          items: [
            {
              id: storyId,
              kind: 'story',
              title: 'عند الطبيب',
              steps: [
                {
                  id: newId(),
                  text: 'نذهب إلى الطبيب',
                  picture: { kind: 'builtin', id: 'car' },
                  voicePath,
                },
              ],
            },
          ],
        };
      },
    });
    await openStories(setup);
    fireEvent.press(screen.getByTestId(`open-${storyId}`));
    await waitFor(() =>
      expect(setup.services.speech.spoken.at(-1)?.items[1]).toEqual({
        utterance: expect.objectContaining({ text: 'نذهب إلى الطبيب' }),
        recordingUri: `file:///documents/${voicePath}`,
      }),
    );
  });
});

describe('built-in routines', () => {
  it('walks through hand washing with its step pictures', async () => {
    const setup = await start();
    await openStories(setup);
    expect(screen.queryByTestId('open-wudu')).toBeNull();
    fireEvent.press(screen.getByTestId('open-handwashing'));
    await waitFor(() =>
      expect(setup.services.speech.last()).toBe(
        'غسل اليدين أبلّل يديّ بالماء.',
      ),
    );
    expect(screen.getAllByTestId('picture-wash-wet').length).toBeGreaterThan(0);
    for (let step = 0; step < 4; step += 1) {
      fireEvent.press(screen.getByTestId('routine-done'));
    }
    expect(screen.getByTestId('routine-all-done')).toBeTruthy();
  });

  it("shows prayer with the parent's choice of pictures", async () => {
    const setup = await start({
      child: { religiousPack: true, prayerPictures: 'girl' },
    });
    await openStories(setup);
    expect(screen.getByTestId('open-wudu')).toBeTruthy();
    fireEvent.press(screen.getByTestId('open-prayer'));
    expect(
      (await screen.findAllByTestId('picture-prayer-girl-stand')).length,
    ).toBeGreaterThan(0);
    expect(screen.queryAllByTestId(/^picture-prayer-boy-/)).toHaveLength(0);
  });
});

describe('routine editor for parents', () => {
  it('builds, reorders and saves a routine', async () => {
    const setup = await start();
    const { services, child } = setup;
    await openSequenceEditor(setup);
    fireEvent.press(screen.getByTestId('sequence-add-routine'));

    fireEvent.press(await screen.findByTestId('sequence-save'));
    expect(await screen.findByText(/أدخل اسمًا/)).toBeTruthy();
    fireEvent.changeText(screen.getByTestId('sequence-title'), 'الصباح');
    fireEvent.press(screen.getByTestId('sequence-save'));
    expect(await screen.findByTestId('sequence-problem')).toBeTruthy();

    fireEvent.press(screen.getByTestId('step-add'));
    fireEvent.press(screen.getByTestId('step-done'));
    expect(await screen.findByText(/أدخل جملة/)).toBeTruthy();
    fireEvent.changeText(screen.getByTestId('step-text'), 'أتناول الفطور');
    fireEvent.press(screen.getByTestId('step-done'));
    expect(await screen.findByTestId('step-problem')).toBeTruthy();
    fireEvent.press(screen.getByTestId('step-picture-food'));
    fireEvent.press(screen.getByTestId('step-done'));
    await screen.findByTestId('step-row-0');

    fireEvent.press(screen.getByTestId('step-add'));
    fireEvent.changeText(screen.getByTestId('step-text'), 'أغسل يديّ');
    fireEvent.press(screen.getByTestId('step-take-photo'));
    await waitFor(() => expect(services.media.files.size).toBe(1));
    fireEvent.press(screen.getByTestId('step-done'));
    await screen.findByTestId('step-row-1');
    fireEvent.press(screen.getByTestId('step-up-1'));
    expect(screen.getByTestId('step-row-0').props.children).toBe('أغسل يديّ');

    fireEvent.press(screen.getByTestId('sequence-save'));
    await screen.findByTestId('sequence-add-routine');
    const { items } = await services.repository.getSequences(child.id);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: 'routine', title: 'الصباح' });
    expect(items[0]?.steps.map((step) => step.text)).toEqual([
      'أغسل يديّ',
      'أتناول الفطور',
    ]);
    expect(items[0]?.steps[0]?.picture.kind).toBe('photo');
    expect(services.media.removed).toEqual([]);
  });

  it('deletes the photo of a removed step when the routine is saved', async () => {
    let routineId = '';
    let photo = '';
    const setup = await start({
      sequences: (childId, newId) => {
        routineId = newId();
        photo = `children/${childId}/aac/${newId()}.jpg`;
        return {
          items: [
            {
              id: routineId,
              kind: 'routine',
              title: 'المساء',
              steps: [
                {
                  id: newId(),
                  text: 'أنظّف أسناني',
                  picture: { kind: 'photo', path: photo },
                  voicePath: null,
                },
                {
                  id: newId(),
                  text: 'أنام',
                  picture: { kind: 'builtin', id: 'sleep' },
                  voicePath: null,
                },
              ],
            },
          ],
        };
      },
    });
    await openSequenceEditor(setup);
    fireEvent.press(screen.getByTestId(`sequence-edit-${routineId}`));
    fireEvent.press(await screen.findByTestId('step-remove-0'));
    fireEvent.press(screen.getByTestId('sequence-save'));
    await waitFor(() => expect(setup.services.media.removed).toEqual([photo]));
  });

  it('discards a new photo when the parent leaves without saving', async () => {
    const setup = await start();
    await openSequenceEditor(setup);
    fireEvent.press(screen.getByTestId('sequence-add-story'));
    fireEvent.press(await screen.findByTestId('step-add'));
    fireEvent.press(screen.getByTestId('step-choose-photo'));
    await waitFor(() => expect(setup.services.media.files.size).toBe(1));
    fireEvent.press(screen.getByText('إلغاء'));
    await screen.findByTestId('sequence-add-story');
    expect(setup.services.media.removed).toHaveLength(1);
    expect(setup.services.media.files.size).toBe(0);
  });

  it('switches the religious pack on from the profile', async () => {
    const setup = await start();
    fireEvent.press(await screen.findByTestId('open-parent'));
    fireEvent.press(await screen.findByTestId('gate-answer'));
    fireEvent.press(await screen.findByTestId(`edit-${setup.child.id}`));
    fireEvent.press(await screen.findByTestId('profile-religious-on'));
    fireEvent.press(screen.getByTestId('profile-save'));
    await screen.findByTestId('profile-saved');
    const [profile] = await setup.services.repository.listProfiles();
    expect(profile?.religiousPack).toBe(true);
  });
});
