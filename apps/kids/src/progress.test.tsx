import {
  createSkillProgress,
  type ChildProfile,
  type TrialRecord,
} from '@luminol/kids-learning';
import {
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from 'expo-router/testing-library';

import { EXPORT_FORMAT } from './reports/exportData';
import { buildReportHtml, escapeHtml } from './reports/reportHtml';
import { createServices } from './services/createServices';
import { APP_ROUTES } from './test/routes';
import {
  addChild,
  createTestServices,
  type TestServices,
} from './test/support';

jest.mock('./services/createServices', () => ({ createServices: jest.fn() }));

type Setup = { services: TestServices; child: ChildProfile };

/** A session with ten matching trials: eight first-try successes. */
async function practise(services: TestServices, child: ChildProfile) {
  const sessionId = services.newId();
  await services.repository.saveSession({
    id: sessionId,
    childId: child.id,
    startedAt: '2026-10-17T08:00:00.000Z',
    endedAt: '2026-10-17T08:10:00.000Z',
    activitiesCompleted: 2,
    calmVisits: 1,
  });
  for (let index = 0; index < 10; index += 1) {
    const trial: TrialRecord = {
      childId: child.id,
      sessionId,
      skillId: 'match-shapes',
      level: 2,
      promptLevel: 'independent',
      firstTryCorrect: index >= 2,
      wrongAttempts: index >= 2 ? 0 : 1,
      escalatedToGuide: false,
      responseMs: 800,
      at: `2026-10-17T08:0${index}:00.000Z`,
    };
    await services.repository.recordTrial(trial, {
      ...createSkillProgress('match-shapes'),
      level: 2,
      promptLevel: 'independent',
    });
  }
}

async function start(
  options: { practised?: boolean; child?: Partial<ChildProfile> } = {},
): Promise<Setup> {
  const services = await createTestServices(7);
  const child = await addChild(services, options.child);
  if (options.practised) await practise(services, child);
  jest.mocked(createServices).mockResolvedValue(services);
  renderRouter(APP_ROUTES, { initialUrl: '/' });
  return { services, child };
}

async function openProgress({ child }: Setup) {
  fireEvent.press(await screen.findByTestId('open-parent'));
  fireEvent.press(await screen.findByTestId('gate-answer'));
  fireEvent.press(await screen.findByTestId(`edit-${child.id}`));
  fireEvent.press(await screen.findByTestId('profile-progress'));
  await screen.findByTestId('progress-report');
}

describe('progress report HTML', () => {
  it('escapes everything a parent typed and lays out right to left', () => {
    expect(escapeHtml(`<b>"&'`)).toBe('&lt;b&gt;&quot;&amp;&#39;');
    const html = buildReportHtml({
      child: {
        id: '00000000-0000-4000-8000-000000000001',
        nickname: 'ريم <script>',
        avatar: 'star-yellow',
        ageBand: '5-6',
        dialect: 'msa',
        interests: ['shapes'],
        numeralStyle: 'western',
        disabledSkills: [],
        religiousPack: false,
        prayerPictures: 'boy',
        sensory: {
          volume: 0.5,
          voiceSpeed: 'slow',
          animationLevel: 'low',
          rewardStyle: 'stars',
          sessionMinutes: 10,
        },
        createdAt: '2026-10-01T08:00:00.000Z',
      },
      activity: {
        sessions: 1,
        activitiesCompleted: 2,
        calmVisits: 0,
        trialsLast7Days: 10,
        daysPracticedLast30: 1,
      },
      skills: [
        {
          skillId: 'match-shapes',
          level: 2,
          maxLevel: 5,
          promptLevel: 'partial',
          trials: 10,
          recentRate: 0.8,
          trend: null,
          lastPracticed: '2026-10-17T08:09:00.000Z',
        },
      ],
      goals: [],
      sessions: [],
      generatedAt: new Date('2026-10-19T08:00:00.000Z'),
    });
    expect(html).toContain('<html lang="ar" dir="rtl">');
    expect(html).not.toContain('<script>');
    expect(html).toContain('ريم &lt;script&gt;');
    expect(html).toContain('مطابقة الأشكال');
    expect(html).toContain('80%');
    expect(html).toContain('2 / 5');
    expect(html).toContain('19/10/2026');
    expect(html).not.toMatch(/https?:\/\//);
  });
});

describe('progress dashboard', () => {
  it('shows level, help and first-try success per skill', async () => {
    const setup = await start({ practised: true });
    await openProgress(setup);
    expect(screen.getByTestId('skill-match-shapes')).toBeTruthy();
    expect(screen.getByTestId('skill-rate-match-shapes').props.children).toBe(
      '80%',
    );
    expect(screen.getByText('2 / 5')).toBeTruthy();
    expect(screen.getByText('دون مساعدة')).toBeTruthy();
    expect(screen.getByLabelText('الجلسات: 1')).toBeTruthy();
    // Last practised on the skill, and the session in the history.
    expect(screen.getAllByText('17/10/2026')).toHaveLength(2);
  });

  it('adds a goal and shows when it is reached', async () => {
    const setup = await start({ practised: true });
    await openProgress(setup);
    fireEvent.press(screen.getByTestId('goal-add'));
    fireEvent.press(screen.getByTestId('goal-skill-match-shapes'));
    fireEvent.press(screen.getByTestId('goal-level-2'));
    fireEvent.press(screen.getByTestId('goal-save'));
    const goal = await waitFor(async () => {
      const { items } = await setup.services.repository.getGoals(
        setup.child.id,
      );
      expect(items).toHaveLength(1);
      return items[0]!;
    });
    expect(goal).toMatchObject({ skillId: 'match-shapes', targetLevel: 2 });
    expect(
      (await screen.findByTestId(`goal-status-${goal.id}`)).props.children,
    ).toBe('✓ تحقّق');
    fireEvent.press(screen.getByTestId(`goal-remove-${goal.id}`));
    await waitFor(async () =>
      expect(
        (await setup.services.repository.getGoals(setup.child.id)).items,
      ).toEqual([]),
    );
  });

  it('shares a PDF report and a JSON export without the child name in file names', async () => {
    const setup = await start({ practised: true });
    const { services } = setup;
    await openProgress(setup);
    fireEvent.press(screen.getByTestId('progress-report'));
    await waitFor(() => expect(services.share.shared).toHaveLength(1));
    const [report] = services.share.shared;
    expect(report?.kind).toBe('pdf');
    expect(report?.fileName).toMatch(/^noor-report-\d{4}-\d{2}-\d{2}\.pdf$/);
    expect(report?.contents).toContain('ريم');

    fireEvent.press(screen.getByTestId('progress-export'));
    await waitFor(() => expect(services.share.shared).toHaveLength(2));
    const exported = services.share.shared[1]!;
    expect(exported.kind).toBe('application/json');
    expect(exported.fileName).toMatch(/^noor-data-.*\.json$/);
    const data = JSON.parse(exported.contents) as {
      format: string;
      profile: { id: string };
      trials: unknown[];
      sessions: unknown[];
    };
    expect(data.format).toBe(EXPORT_FORMAT);
    expect(data.profile.id).toBe(setup.child.id);
    expect(data.trials).toHaveLength(10);
    expect(data.sessions).toHaveLength(1);
  });

  it('says so when the device cannot share', async () => {
    const setup = await start();
    setup.services.share.result = 'unavailable';
    await openProgress(setup);
    fireEvent.press(screen.getByTestId('progress-report'));
    expect(await screen.findByTestId('progress-notice')).toBeTruthy();
  });

  it('clears the history after confirmation and keeps the profile', async () => {
    const setup = await start({ practised: true });
    const { services, child } = setup;
    await openProgress(setup);
    fireEvent.press(screen.getByTestId('progress-clear'));
    fireEvent.press(screen.getByTestId('progress-clear-confirm'));
    expect(await screen.findByText('تم مسح السجلّ')).toBeTruthy();
    expect(await services.repository.listTrials(child.id)).toEqual([]);
    expect(await services.repository.listSessions(child.id)).toEqual([]);
    expect(await services.repository.listProgress(child.id)).toEqual([]);
    expect(await services.repository.listProfiles()).toHaveLength(1);
    expect(screen.getByText('لم يتدرّب الطفل على أي نشاط بعد.')).toBeTruthy();
  });
});
