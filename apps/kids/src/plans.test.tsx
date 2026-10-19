import { PARENT_COPY, skillTitle } from '@luminol/kids-content';
import {
  FREE_SKILLS,
  PLUS_FEATURES,
  skillsForAge,
  type ChildProfile,
} from '@luminol/kids-learning';
import {
  act,
  fireEvent,
  renderRouter,
  screen,
  waitFor,
} from 'expo-router/testing-library';
import { Linking } from 'react-native';

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
    plan?: 'free' | 'plus';
    available?: boolean;
    child?: Partial<ChildProfile>;
  } = {},
): Promise<Setup> {
  const services = await createTestServices(8);
  services.purchases.plan = options.plan ?? 'free';
  services.purchases.available = options.available ?? true;
  const child = await addChild(services, options.child);
  jest.mocked(createServices).mockResolvedValue(services);
  renderRouter(APP_ROUTES, { initialUrl: '/' });
  return { services, child };
}

async function openParent() {
  fireEvent.press(await screen.findByTestId('open-parent'));
  fireEvent.press(await screen.findByTestId('gate-answer'));
  await screen.findByTestId('open-plus');
}

describe('free plan', () => {
  it('only schedules free activities', async () => {
    const { services, child } = await start({ child: { ageBand: '7-8' } });
    fireEvent.press(await screen.findByTestId(`child-${child.id}`));
    await waitFor(async () =>
      expect(await services.repository.countSessions(child.id)).toBe(1),
    );
    const locked = skillsForAge('7-8')
      .filter((id) => !FREE_SKILLS.includes(id))
      .map((id) => skillTitle(id).text);
    // The 7-8 rotation starts with a free activity followed by a Plus one.
    expect(locked).toContain('فرز الأشكال');
    for (const title of locked) expect(screen.queryByText(title)).toBeNull();
    expect(screen.getByText('مطابقة الأشكال')).toBeTruthy();
  });

  it('keeps one child, then offers Plus for more', async () => {
    await start();
    await openParent();
    expect(screen.queryByTestId('add-child')).toBeNull();
    expect(screen.getByTestId('profile-limit')).toBeTruthy();
  });

  it('locks own routines and sends the parent to Plus', async () => {
    const { child } = await start();
    await openParent();
    fireEvent.press(screen.getByTestId(`edit-${child.id}`));
    fireEvent.press(await screen.findByTestId('profile-sequences'));
    expect(screen.queryByTestId('sequence-add-routine')).toBeNull();
    fireEvent.press(await screen.findByTestId('sequence-add-routine-locked'));
    expect(await screen.findByTestId('plus-buy-$rc_monthly')).toBeTruthy();
  });

  it('locks the PDF report but keeps the data export', async () => {
    const { child } = await start();
    await openParent();
    fireEvent.press(screen.getByTestId(`edit-${child.id}`));
    fireEvent.press(await screen.findByTestId('profile-progress'));
    expect(await screen.findByTestId('progress-report-locked')).toBeTruthy();
    expect(screen.queryByTestId('progress-report')).toBeNull();
    expect(screen.getByTestId('progress-export')).toBeTruthy();
  });

  it('offers only free themes and activities in the profile', async () => {
    const { child } = await start();
    await openParent();
    fireEvent.press(screen.getByTestId(`edit-${child.id}`));
    expect(await screen.findByTestId('profile-interests-food')).toBeTruthy();
    expect(screen.queryByTestId('profile-interests-animals')).toBeNull();
    expect(screen.getByTestId('profile-activities-match-shapes')).toBeTruthy();
    expect(screen.queryByTestId('profile-activities-sort-size')).toBeNull();
    expect(
      screen.getByText(new RegExp(PARENT_COPY.plus.themesNote)),
    ).toBeTruthy();
  });
});

describe('Plus', () => {
  it('lists what Plus adds, buys a subscription and unlocks profiles', async () => {
    const { services } = await start();
    await openParent();
    fireEvent.press(screen.getByTestId('open-plus'));
    for (const feature of PLUS_FEATURES) {
      expect(
        screen.getByText(`✓ ${PARENT_COPY.plus.features[feature]}`),
      ).toBeTruthy();
    }
    expect(await screen.findByText('29,99 € سنويًا')).toBeTruthy();
    expect(screen.getByText(PARENT_COPY.plus.terms)).toBeTruthy();
    fireEvent.press(screen.getByTestId('plus-buy-$rc_annual'));
    expect(await screen.findByTestId('plus-active')).toBeTruthy();
    expect(services.purchases.purchased).toEqual(['$rc_annual']);
  });

  it('offers a one-time lifetime purchase after the subscriptions', async () => {
    const { services } = await start();
    await openParent();
    fireEvent.press(screen.getByTestId('open-plus'));
    expect(await screen.findByText('59,99 € دفعة واحدة')).toBeTruthy();
    expect(screen.getByText(PARENT_COPY.plus.lifetimeTerms)).toBeTruthy();
    const order = screen
      .getAllByTestId(/^plus-buy-/)
      .map((button) => button.props.testID);
    expect(order).toEqual([
      'plus-buy-$rc_monthly',
      'plus-buy-$rc_annual',
      'plus-buy-$rc_lifetime',
    ]);
    fireEvent.press(screen.getByTestId('plus-buy-$rc_lifetime'));
    expect(await screen.findByTestId('plus-active')).toBeTruthy();
    expect(services.purchases.purchased).toEqual(['$rc_lifetime']);
  });

  it('says when a payment is still pending', async () => {
    const { services } = await start();
    services.purchases.nextOutcome = 'pending';
    await openParent();
    fireEvent.press(screen.getByTestId('open-plus'));
    fireEvent.press(await screen.findByTestId('plus-buy-$rc_monthly'));
    expect((await screen.findByTestId('plus-notice')).props.children).toBe(
      PARENT_COPY.plus.pending,
    );
    expect(screen.queryByTestId('plus-active')).toBeNull();
  });

  it('opens Google Play to manage the subscription', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await start({ plan: 'plus' });
    await openParent();
    fireEvent.press(screen.getByTestId('open-plus'));
    expect(await screen.findByTestId('plus-active')).toBeTruthy();
    expect(screen.queryByTestId('plus-buy-$rc_monthly')).toBeNull();
    fireEvent.press(screen.getByTestId('plus-manage'));
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('play.google.com/store/account/subscriptions'),
    );
    open.mockRestore();
  });

  it('follows the store when a subscription ends', async () => {
    const { services } = await start({ plan: 'plus' });
    await openParent();
    expect(screen.getByTestId('add-child')).toBeTruthy();
    act(() => services.purchases.setPlan('free'));
    expect(await screen.findByTestId('profile-limit')).toBeTruthy();
  });

  it('marks a testing build that opens Plus without selling it', async () => {
    const services = await createTestServices(8);
    services.purchases.available = false;
    services.purchases.testing = true;
    await addChild(services);
    jest.mocked(createServices).mockResolvedValue(services);
    renderRouter(APP_ROUTES, { initialUrl: '/' });
    await openParent();
    expect(screen.getByTestId('testing-build')).toBeTruthy();
    fireEvent.press(screen.getByTestId('open-plus'));
    expect((await screen.findByTestId('plus-unavailable')).props.children).toBe(
      PARENT_COPY.plus.testing,
    );
  });

  it('explains when this build cannot sell subscriptions', async () => {
    await start({ available: false });
    await openParent();
    fireEvent.press(screen.getByTestId('open-plus'));
    expect(await screen.findByTestId('plus-unavailable')).toBeTruthy();
    expect(screen.queryByTestId('plus-restore')).toBeNull();
  });
});

describe('privacy', () => {
  it('shows the privacy policy in the parent area', async () => {
    await start();
    await openParent();
    fireEvent.press(screen.getByTestId('open-privacy'));
    expect(await screen.findByText('سياسة الخصوصية')).toBeTruthy();
    expect(screen.getByText(/لا يعرض إعلانات/)).toBeTruthy();
  });
});
