import { router } from 'expo-router';
import {
  act,
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from 'expo-router/testing-library';

import { CELEBRATE_MS } from './games/useTrialFlow';
import { createServices } from './services/createServices';
import {
  addChild,
  createTestServices,
  type TestServices,
} from './test/support';
import ActivityScreen from '../app/activity';
import CalmScreen from '../app/calm';
import GateScreen from '../app/gate';
import ChooserScreen from '../app/index';
import RootLayout from '../app/_layout';
import EditProfileScreen from '../app/parent/[childId]';
import ParentHomeScreen from '../app/parent/index';
import ParentLayout from '../app/parent/_layout';
import NewProfileScreen from '../app/parent/new';
import SessionScreen from '../app/session';

jest.mock('./services/createServices', () => ({ createServices: jest.fn() }));
jest.useFakeTimers();

const routes = {
  _layout: RootLayout,
  index: ChooserScreen,
  gate: GateScreen,
  session: SessionScreen,
  activity: ActivityScreen,
  calm: CalmScreen,
  'parent/_layout': ParentLayout,
  'parent/index': ParentHomeScreen,
  'parent/new': NewProfileScreen,
  'parent/[childId]': EditProfileScreen,
};

async function start(prepare?: (services: TestServices) => Promise<void>) {
  const services = await createTestServices(3);
  await prepare?.(services);
  jest.mocked(createServices).mockResolvedValue(services);
  renderRouter(routes, { initialUrl: '/' });
  return services;
}

async function passGate() {
  fireEvent.press(await screen.findByTestId('gate-answer'));
}

describe('kids app', () => {
  it('walks a parent from first launch to a saved child profile', async () => {
    const services = await start();
    fireEvent.press(await screen.findByTestId('welcome-start'));
    expect(await screen.findByText('للوالدين فقط')).toBeTruthy();
    await passGate();

    fireEvent.press(await screen.findByTestId('add-child'));
    fireEvent.press(await screen.findByTestId('profile-save'));
    expect(await screen.findByText(/أدخل اسمًا قصيرًا/)).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('profile-nickname'), '  يوسف ');
    fireEvent.press(screen.getByTestId('profile-avatar-triangle-green'));
    fireEvent.press(screen.getByTestId('profile-age-3-4'));
    fireEvent.press(screen.getByTestId('profile-save'));

    expect(await screen.findByText('يوسف')).toBeTruthy();
    const [saved] = await services.repository.listProfiles();
    expect(saved).toMatchObject({
      nickname: 'يوسف',
      avatar: 'triangle-green',
      ageBand: '3-4',
    });

    fireEvent.press(screen.getByTestId('parent-exit'));
    expect(await screen.findByText('من سيلعب اليوم؟')).toBeTruthy();
  });

  it('rejects a wrong gate answer with a new question', async () => {
    await start();
    fireEvent.press(await screen.findByTestId('open-parent'));
    await screen.findByTestId('gate-prompt');
    fireEvent.press(screen.getAllByTestId(/^gate-option-/)[0]!);
    expect(await screen.findByTestId('gate-retry')).toBeTruthy();
    expect(screen.getByTestId('gate-prompt')).toBeTruthy();
    expect(screen.queryByTestId('add-child')).toBeNull();
  });

  it('keeps parent routes behind the gate', async () => {
    await start();
    await screen.findByTestId('welcome-start');
    act(() => {
      router.push('/parent');
    });
    expect(await screen.findByText('للوالدين فقط')).toBeTruthy();
  });

  it('locks the parent area again after returning to the chooser', async () => {
    await start(async (prepared) => {
      await addChild(prepared);
    });
    fireEvent.press(await screen.findByTestId('open-parent'));
    await passGate();
    fireEvent.press(await screen.findByTestId('parent-exit'));
    await screen.findByText('من سيلعب اليوم؟');
    act(() => {
      router.push('/parent');
    });
    expect(await screen.findByText('للوالدين فقط')).toBeTruthy();
    expect(screen.queryByTestId('add-child')).toBeNull();
  });

  it('saves sensory settings from the parent area', async () => {
    let childId = '';
    const services = await start(async (prepared) => {
      childId = (await addChild(prepared)).id;
    });
    fireEvent.press(await screen.findByTestId('open-parent'));
    await passGate();
    fireEvent.press(await screen.findByTestId(`edit-${childId}`));
    fireEvent.press(await screen.findByTestId('sensory-volume-0.25'));
    fireEvent.press(screen.getByTestId('sensory-animation-none'));
    fireEvent.press(screen.getByTestId('sensory-reward-quiet'));
    fireEvent.press(screen.getByTestId('sensory-session-5'));
    fireEvent.press(screen.getByTestId('profile-save'));
    expect(await screen.findByTestId('profile-saved')).toBeTruthy();
    const [profile] = await services.repository.listProfiles();
    expect(profile?.sensory).toEqual({
      volume: 0.25,
      voiceSpeed: 'slow',
      animationLevel: 'none',
      rewardStyle: 'quiet',
      sessionMinutes: 5,
    });
  });

  it('deletes a profile after confirmation', async () => {
    let childId = '';
    const services = await start(async (prepared) => {
      childId = (await addChild(prepared)).id;
    });
    fireEvent.press(await screen.findByTestId('open-parent'));
    await passGate();
    fireEvent.press(await screen.findByTestId(`edit-${childId}`));
    fireEvent.press(await screen.findByTestId('profile-delete'));
    fireEvent.press(await screen.findByTestId('profile-delete-confirm'));
    await waitFor(async () =>
      expect(await services.repository.listProfiles()).toEqual([]),
    );
  });

  it('shows the child a first-then schedule and plays the first activity', async () => {
    let childId = '';
    const services = await start(async (prepared) => {
      childId = (await addChild(prepared, { ageBand: '3-4' })).id;
    });
    fireEvent.press(await screen.findByTestId(`child-${childId}`));

    expect(await screen.findByText('المس وشاهد')).toBeTruthy();
    expect(screen.getByText('مطابقة الأشكال')).toBeTruthy();
    await waitFor(() =>
      expect(services.speech.texts()).toContain(
        'أوّلًا المس وشاهد، ثمّ مطابقة الأشكال',
      ),
    );
    expect(await services.repository.countSessions(childId)).toBe(1);

    fireEvent.press(screen.getByTestId('session-start'));
    expect(await screen.findByText('لنلمس الشكل')).toBeTruthy();
    expect(screen.getByTestId('nav-schedule')).toBeTruthy();
    expect(screen.getByTestId('nav-calm')).toBeTruthy();
  });

  it('opens the calm corner from a child screen with a gentle sound', async () => {
    let childId = '';
    const services = await start(async (prepared) => {
      childId = (await addChild(prepared)).id;
    });
    fireEvent.press(await screen.findByTestId(`child-${childId}`));
    fireEvent.press(await screen.findByTestId('nav-calm'));

    expect(await screen.findByTestId('calm-breath')).toBeTruthy();
    expect(screen.getByTestId('calm-breath').props.children).toBe('شهيق');
    expect(services.calmSound.events).toContain('start:0.3');
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(screen.getByTestId('calm-breath').props.children).toBe('زفير');

    fireEvent.press(screen.getByTestId('calm-sound'));
    expect(services.calmSound.events.at(-1)).toBe('stop');

    fireEvent.press(screen.getByTestId('calm-back'));
    expect(await screen.findByTestId('session-start')).toBeTruthy();
    expect(services.calmSound.events.at(-1)).toBe('stop');
  });

  it('plays a whole short session and records it', async () => {
    let childId = '';
    const services = await start(async (prepared) => {
      const child = await addChild(prepared, { ageBand: '7-8' });
      childId = child.id;
      await prepared.repository.saveProfile({
        ...child,
        sensory: { ...child.sensory, sessionMinutes: 5 },
      });
    });
    fireEvent.press(await screen.findByTestId(`child-${childId}`));

    for (const instruction of ['لنبحث عن الشكل نفسه', 'لنضع الشكل مع شكله']) {
      fireEvent.press(await screen.findByTestId('session-start'));
      expect(await screen.findByText(instruction)).toBeTruthy();
      for (let trial = 0; trial < 5; trial += 1) {
        fireEvent.press(await screen.findByTestId('choice-correct'));
        await act(async () => {
          jest.advanceTimersByTime(CELEBRATE_MS);
        });
      }
      fireEvent.press(await screen.findByTestId('activity-back'));
    }

    expect(await screen.findByText('انتهينا! أحسنت')).toBeTruthy();
    fireEvent.press(screen.getByTestId('session-finish'));
    expect(await screen.findByText('من سيلعب اليوم؟')).toBeTruthy();

    const trials = await services.repository.listTrials(childId);
    expect(trials.map((trial) => trial.skillId)).toEqual([
      ...Array<string>(5).fill('match-shapes'),
      ...Array<string>(5).fill('sort-shape'),
    ]);
    const row = await services.db.getFirstAsync<{ data: string }>(
      'SELECT data FROM sessions WHERE child_id = ?',
      [childId],
    );
    expect(JSON.parse(row?.data ?? '{}')).toMatchObject({
      activitiesCompleted: 2,
      endedAt: expect.any(String),
    });
  });
});
