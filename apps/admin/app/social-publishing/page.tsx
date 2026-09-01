import { requirePermission } from '@luminol/auth';
import { db, materializeSocialPublishingDeliveryPlan } from '@luminol/database';
import {
  formatLocalizedDate,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminRequestLocale } from '../../lib/request-locale';
import {
  getSocialPublishingCopy,
  type SocialPublishingCopy,
} from '../../lib/social-publishing-localization';
import {
  createSocialPublishingAccountAction,
  planSocialPublishingAttemptAction,
  setSocialPublishingAccountActiveAction,
} from './actions';

type SearchValue = string | string[] | undefined;

type SocialPublishingPageProps = {
  searchParams: Promise<Record<string, SearchValue>>;
};

function firstSearchParam(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function boundedDeliveryError(error: unknown, copy: SocialPublishingCopy) {
  if (!(error instanceof Error)) return copy.deliveryError.unavailable;

  const mappings: Array<[string, string]> = [
    ['Social publishing proposal is not ready:', copy.deliveryError.notReady],
    [
      'Social publishing proposal is not approved',
      copy.deliveryError.notApproved,
    ],
    [
      'Social publishing proposal action ID mismatch',
      copy.deliveryError.actionMismatch,
    ],
    [
      'Social publishing content is no longer publishable',
      copy.deliveryError.contentNotPublishable,
    ],
    [
      'Social publishing content revision no longer matches approval',
      copy.deliveryError.revisionMismatch,
    ],
    [
      'Social publishing content target no longer matches approval',
      copy.deliveryError.contentTargetMismatch,
    ],
    [
      'Social publishing account is inactive',
      copy.deliveryError.accountInactive,
    ],
    [
      'Social publishing account target mismatch',
      copy.deliveryError.accountTargetMismatch,
    ],
    [
      'Social publishing content requires an asset reference',
      copy.deliveryError.assetRequired,
    ],
    ['Social publishing content not found', copy.deliveryError.contentNotFound],
    ['Social publishing account not found', copy.deliveryError.accountNotFound],
    ['AI Operator proposal not found', copy.deliveryError.proposalNotFound],
  ];

  return (
    mappings.find(([prefix]) => error.message.startsWith(prefix))?.[1] ??
    copy.deliveryError.unavailable
  );
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

  const [accounts, attempts] = await Promise.all([
    db.socialPublishingAccount.findMany({
      orderBy: [{ active: 'desc' }, { updatedAt: 'desc' }],
      include: {
        events: {
          orderBy: { occurredAt: 'desc' },
          take: 5,
          include: { actor: { select: { email: true } } },
        },
      },
    }),
    db.socialPublishingAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        content: { select: { title: true } },
        events: {
          orderBy: { occurredAt: 'desc' },
          take: 8,
          include: { actor: { select: { email: true } } },
        },
      },
    }),
  ]);

  let deliveryPlan: Awaited<
    ReturnType<typeof materializeSocialPublishingDeliveryPlan>
  > | null = null;
  let deliveryError: string | null = null;
  if (proposalId) {
    try {
      deliveryPlan = await materializeSocialPublishingDeliveryPlan(
        db,
        proposalId,
      );
    } catch (error) {
      deliveryError = boundedDeliveryError(error, copy);
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
                <input
                  type="text"
                  name="displayName"
                  maxLength={160}
                  required
                />
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
                      <input
                        type="hidden"
                        name="accountId"
                        value={account.id}
                      />
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
                          {copy.eventType[event.eventType]} ·{' '}
                          {date(event.occurredAt)} · {event.actor.email}
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
                  <dt>{copy.contentRevision}</dt>
                  <dd>
                    {deliveryPlan.contentCalendarItemId} · r
                    {deliveryPlan.contentRevision}
                  </dd>
                  <dt>{copy.format}</dt>
                  <dd>{deliveryPlan.format}</dd>
                  <dt>{copy.caption}</dt>
                  <dd>{deliveryPlan.caption}</dd>
                  <dt>{copy.asset}</dt>
                  <dd>{deliveryPlan.assetReference}</dd>
                  <dt>{copy.schedule}</dt>
                  <dd>
                    {deliveryPlan.scheduledFor
                      ? `${deliveryPlan.scheduledFor.toISOString()} · ${deliveryPlan.timezone ?? 'UTC'}`
                      : copy.notScheduled}
                  </dd>
                </dl>
                <form action={planSocialPublishingAttemptAction}>
                  <input
                    type="hidden"
                    name="proposalId"
                    value={deliveryPlan.proposalId}
                  />
                  <button type="submit">{copy.planAttempt}</button>
                </form>
                <p>{copy.planAttemptHelp}</p>
                <p>{copy.noCredentials}</p>
              </article>
            ) : null}
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.attemptLedger}</h2>
                <p>{copy.attemptLedgerIntro}</p>
              </div>
            </div>
            {attempts.length === 0 ? (
              <p>{copy.noAttempts}</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {attempts.map((attempt) => (
                  <article key={attempt.id} className="admin-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>{attempt.actionId}</h3>
                        <p>
                          {copy.platformName[attempt.platform]} ·{' '}
                          {attempt.accountRef} · {attempt.content.title}
                        </p>
                      </div>
                      <strong>{copy.attemptStatus[attempt.status]}</strong>
                    </div>
                    <dl>
                      <dt>{copy.proposalId}</dt>
                      <dd>{attempt.proposalId}</dd>
                      <dt>{copy.externalAccountId}</dt>
                      <dd>{attempt.externalAccountId}</dd>
                      <dt>{copy.contentRevision}</dt>
                      <dd>
                        {attempt.contentCalendarItemId} · r
                        {attempt.contentRevision}
                      </dd>
                      <dt>{copy.attemptCount}</dt>
                      <dd>{attempt.attemptCount}</dd>
                      <dt>{copy.nextAttempt}</dt>
                      <dd>{date(attempt.nextAttemptAt)}</dd>
                      <dt>{copy.providerReference}</dt>
                      <dd>{attempt.providerReference ?? copy.none}</dd>
                      <dt>{copy.errorCode}</dt>
                      <dd>{attempt.lastErrorCode ?? copy.none}</dd>
                    </dl>
                    <small>
                      {attempt.events.map((event) => (
                        <span key={event.id} style={{ display: 'block' }}>
                          {copy.attemptEventType[event.eventType]} ·{' '}
                          {date(event.occurredAt)} ·{' '}
                          {event.actor?.email ?? copy.systemActor}
                          {event.errorCode ? ` · ${event.errorCode}` : ''}
                        </span>
                      ))}
                    </small>
                  </article>
                ))}
              </div>
            )}
            <p>{copy.noCredentials}</p>
          </section>
        </div>
      </section>
    </main>
  );
}
