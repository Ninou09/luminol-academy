import { requirePermission } from '@luminol/auth';
import {
  db,
  materializeSocialPublishingDeliveryPlan,
} from '@luminol/database';
import {
  formatLocalizedDate,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { getSocialPublishingCopy } from '../../lib/social-publishing-localization';
import {
  createSocialPublishingAccountAction,
  setSocialPublishingAccountActiveAction,
} from './actions';

type SearchValue = string | string[] | undefined;

type SocialPublishingPageProps = {
  searchParams: Promise<Record<string, SearchValue>>;
};

function firstSearchParam(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function boundedDeliveryError(error: unknown) {
  if (!(error instanceof Error)) return 'Delivery plan is unavailable.';
  const allowedPrefixes = [
    'Social publishing proposal is not ready:',
    'Social publishing proposal is not approved',
    'Social publishing proposal action ID mismatch',
    'Social publishing content is no longer publishable',
    'Social publishing content revision no longer matches approval',
    'Social publishing content target no longer matches approval',
    'Social publishing account is inactive',
    'Social publishing account target mismatch',
    'Social publishing content requires an asset reference',
    'Social publishing content not found',
    'Social publishing account not found',
    'AI Operator proposal not found',
  ];
  return allowedPrefixes.some((prefix) => error.message.startsWith(prefix))
    ? error.message
    : 'Delivery plan is unavailable.';
}

export default async function SocialPublishingPage({
  searchParams,
}: SocialPublishingPageProps) {
  await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getSocialPublishingCopy(locale);
  const common = getCommonDictionary(locale);
  const params = await searchParams;
  const proposalId = firstSearchParam(params.proposalId)?.trim() ?? '';

  const accounts = await db.socialPublishingAccount.findMany({
    orderBy: [{ active: 'desc' }, { updatedAt: 'desc' }],
    include: {
      createdBy: { select: { email: true } },
      updatedBy: { select: { email: true } },
      events: {
        orderBy: { occurredAt: 'desc' },
        take: 5,
        include: { actor: { select: { email: true } } },
      },
    },
  });

  let deliveryPlan: Awaited<
    ReturnType<typeof materializeSocialPublishingDeliveryPlan>
  > | null = null;
  let deliveryError: string | null = null;
  if (proposalId) {
    try {
      deliveryPlan = await materializeSocialPublishingDeliveryPlan(db, proposalId);
    } catch (error) {
      deliveryError = boundedDeliveryError(error);
    }
  }

  const date = (value: Date) => formatLocalizedDate(value, locale);

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <Link href={localizeHref(locale, '/content-calendar')}>
                {copy.calendar}
              </Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.accountRegistry}</h2>
                <p>{copy.accountRegistryIntro}</p>
              </div>
            </div>
            <form
              action={createSocialPublishingAccountAction}
              style={{ display: 'grid', gap: '0.75rem' }}
            >
              <label>
                <span>{copy.platform}</span>
                <select name="platform" defaultValue="INSTAGRAM">
                  <option value="INSTAGRAM">
                    {copy.platformName.INSTAGRAM}
                  </option>
                  <option value="FACEBOOK">{copy.platformName.FACEBOOK}</option>
                </select>
              </label>
              <label>
                <span>{copy.accountRef}</span>
                <input type="text" name="accountRef" maxLength={255} required />
              </label>
              <label>
                <span>{copy.displayName}</span>
                <input type="text" name="displayName" maxLength={160} required />
              </label>
              <label>
                <span>{copy.externalAccountId}</span>
                <input
                  type="text"
                  name="externalAccountId"
                  maxLength={255}
                  required
                />
              </label>
              <button type="submit">{copy.createAccount}</button>
            </form>
            <p>{copy.noCredentials}</p>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.accountRegistry}</h2>
              </div>
            </div>
            {accounts.length === 0 ? (
              <p>{copy.noAccounts}</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {accounts.map((account) => (
                  <article key={account.id} className="admin-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>{account.displayName}</h3>
                        <p>
                          {copy.platformName[account.platform]} ·{' '}
                          {account.accountRef} · {account.externalAccountId}
                        </p>
                      </div>
                      <strong>
                        {account.active ? copy.active : copy.inactive}
                      </strong>
                    </div>
                    <form action={setSocialPublishingAccountActiveAction}>
                      <input type="hidden" name="accountId" value={account.id} />
                      <input
                        type="hidden"
                        name="expectedActive"
                        value={String(account.active)}
                      />
                      <input
                        type="hidden"
                        name="active"
                        value={String(!account.active)}
                      />
                      <button type="submit">
                        {account.active ? copy.deactivate : copy.activate}
                      </button>
                    </form>
                    <small>
                      {account.events.map((event) => (
                        <span key={event.id} style={{ display: 'block' }}>
                          {event.eventType} · {date(event.occurredAt)} ·{' '}
                          {event.actor.email}
                        </span>
                      ))}
                    </small>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.deliveryReview}</h2>
                <p>{copy.deliveryReviewIntro}</p>
              </div>
            </div>
            <form method="get" style={{ display: 'flex', gap: '0.75rem' }}>
              <label style={{ flex: 1 }}>
                <span>{copy.proposalId}</span>
                <input
                  type="text"
                  name="proposalId"
                  defaultValue={proposalId}
                  maxLength={255}
                  required
                />
              </label>
              <button type="submit">{copy.materialize}</button>
            </form>

            {deliveryError ? <p role="alert">{deliveryError}</p> : null}
            {deliveryPlan ? (
              <article className="admin-panel">
                <h3>{deliveryPlan.actionId}</h3>
                <dl>
                  <dt>{copy.platform}</dt>
                  <dd>{copy.platformName[deliveryPlan.platform]}</dd>
                  <dt>{copy.accountRef}</dt>
                  <dd>{deliveryPlan.accountRef}</dd>
                  <dt>{copy.externalAccountId}</dt>
                  <dd>{deliveryPlan.externalAccountId}</dd>
                  <dt>Content revision</dt>
                  <dd>
                    {deliveryPlan.contentCalendarItemId} · r
                    {deliveryPlan.contentRevision}
                  </dd>
                  <dt>Format</dt>
                  <dd>{deliveryPlan.format}</dd>
                  <dt>Caption</dt>
                  <dd>{deliveryPlan.caption}</dd>
                  <dt>Asset</dt>
                  <dd>{deliveryPlan.assetReference}</dd>
                  <dt>Schedule</dt>
                  <dd>
                    {deliveryPlan.scheduledFor
                      ? `${deliveryPlan.scheduledFor.toISOString()} · ${deliveryPlan.timezone ?? 'UTC'}`
                      : 'Not scheduled'}
                  </dd>
                </dl>
                <p>{copy.noCredentials}</p>
              </article>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
