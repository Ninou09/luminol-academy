import { requirePermission } from '@luminol/auth';
import { db, getAiProviderUsageSummary } from '@luminol/database';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  getCommonDictionary,
  localizeHref,
} from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { AiProviderRunPanel } from '../../components/ai-provider-run-panel';
import { getAiProviderCopy } from '../../lib/ai-provider-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';

function formatUsdMicros(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value / 1_000_000);
}

export default async function AiProviderGatewayPage() {
  await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getAiProviderCopy(locale);
  const common = getCommonDictionary(locale);
  const summary = await getAiProviderUsageSummary(db);
  const number = (value: number) => formatLocalizedNumber(value, locale);
  const money = (value: number) => formatUsdMicros(value, locale);
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <Link href={localizeHref(locale, '/ai-operator')}>
                {copy.operatorQueue}
              </Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="metric-grid" aria-label={copy.title}>
            <article>
              <span>{copy.mode}</span>
              <strong>{summary.mode}</strong>
            </article>
            <article>
              <span>{copy.model}</span>
              <strong dir="ltr">{summary.model}</strong>
            </article>
            <article>
              <span>{copy.monthlyBudget}</span>
              <strong>{money(summary.budgetUsdMicros)}</strong>
            </article>
            <article>
              <span>{copy.spent}</span>
              <strong>{money(summary.spentUsdMicros)}</strong>
            </article>
            <article>
              <span>{copy.remaining}</span>
              <strong>{money(summary.remainingUsdMicros)}</strong>
            </article>
            <article>
              <span>{copy.requests}</span>
              <strong>{number(summary.requests)}</strong>
            </article>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.budgetStatus}</h2>
                <p>{copy.modeDescription[summary.mode]}</p>
              </div>
              <span className="data-status">{copy.warning[summary.warning]}</span>
            </div>
            <div className="compact-list">
              <article>
                <span>{copy.succeeded}</span>
                <strong>{number(summary.succeeded)}</strong>
              </article>
              <article>
                <span>{copy.failed}</span>
                <strong>{number(summary.failed)}</strong>
              </article>
              <article>
                <span>{copy.blocked}</span>
                <strong>{number(summary.blocked)}</strong>
              </article>
              <article>
                <span>{copy.tokens}</span>
                <strong>
                  {number(summary.inputTokens)} {copy.inputTokens} ·{' '}
                  {number(summary.outputTokens)} {copy.outputTokens}
                </strong>
              </article>
            </div>
          </section>

          <AiProviderRunPanel
            title={copy.runTitle}
            intro={copy.runIntro}
            action={copy.runAction}
            running={copy.running}
            advisoryLabel={copy.advisoryLabel}
            noSideEffects={copy.noSideEffects}
            blockedResult={copy.blockedResult}
            failedResult={copy.failedResult}
            errorCodeLabel={copy.errorCode}
          />

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>{copy.recentFailures}</h2>
                <p>{copy.privacy}</p>
              </div>
            </div>

            {summary.recentFailures.length === 0 ? (
              <p className="admin-empty">{copy.noFailures}</p>
            ) : (
              <div className="compact-list">
                {summary.recentFailures.map((failure) => (
                  <article key={failure.id} style={{ alignItems: 'start' }}>
                    <div>
                      <strong>{copy.taskLabel[failure.taskClass]}</strong>
                      <p dir="ltr">
                        {copy.errorCode}: {failure.errorCode ?? 'UNKNOWN'}
                      </p>
                      <small dir="auto">
                        {copy.model}: {failure.model ?? '—'}
                      </small>
                    </div>
                    <div>
                      <span className="data-status">{failure.providerMode}</span>
                      <small>
                        {copy.occurredAt}: {date(failure.occurredAt)}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
