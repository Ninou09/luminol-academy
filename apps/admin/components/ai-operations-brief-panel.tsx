import {
  formatLocalizedNumber,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import { aiOperatorExecutionPolicyByKind } from '@luminol/validation/ai-operator';
import Link from 'next/link';

import { buildAiOperationsBriefActions } from '../lib/ai-operator-actions';
import { getAiOperatorProposalQueueCopy } from '../lib/ai-operator-proposal-localization';
import { getAiProviderCopy } from '../lib/ai-provider-localization';
import {
  getAiOperationsBriefCopy,
  getAiOperationsBriefItemText,
} from '../lib/ai-operations-brief-localization';
import {
  buildAiOperationsBrief,
  type AiOperationsBriefInput,
} from '../lib/ai-operations-brief';
import { getContentCalendarCopy } from '../lib/content-calendar-localization';
import { getSocialPublishingCopy } from '../lib/social-publishing-localization';

type AiOperationsBriefPanelProps = {
  locale: Locale;
  operations: AiOperationsBriefInput;
};

export function AiOperationsBriefPanel({
  locale,
  operations,
}: AiOperationsBriefPanelProps) {
  const copy = getAiOperationsBriefCopy(locale);
  const proposalCopy = getAiOperatorProposalQueueCopy(locale);
  const aiProviderCopy = getAiProviderCopy(locale);
  const contentCalendarCopy = getContentCalendarCopy(locale);
  const socialPublishingCopy = getSocialPublishingCopy(locale);
  const brief = buildAiOperationsBrief(operations);
  const briefActions = buildAiOperationsBriefActions(brief);
  const executionPolicy = aiOperatorExecutionPolicyByKind.OPEN_ENQUIRY_QUEUE;
  const number = (value: number) => formatLocalizedNumber(value, locale);

  return (
    <section className="admin-panel" aria-label={copy.title}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        <span>
          {copy.mode} · {copy.executionPolicy(executionPolicy)}
        </span>
      </div>

      {brief.status === 'clear' ? (
        <div className="compact-list">
          <article>
            <div>
              <h3>{copy.allClearTitle}</h3>
              <p>{copy.allClearBody}</p>
            </div>
            <div>
              <span className="data-status status-active">0</span>
            </div>
          </article>
        </div>
      ) : (
        <div className="compact-list">
          {briefActions.map(({ item, action }) => {
            const itemCount = number(item.count);
            const text = getAiOperationsBriefItemText(copy, item, itemCount);

            return (
              <article key={action.actionId}>
                <div>
                  <h3>{text.title}</h3>
                  <p>{text.body}</p>
                </div>
                <div>
                  <span className="data-status">{itemCount}</span>
                  <Link
                    className="data-status"
                    href={localizeHref(
                      locale,
                      `/enquiries?${action.payload.query}`,
                    )}
                  >
                    {copy.action}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p
        style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <Link href={localizeHref(locale, '/ai-operator')}>
          {proposalCopy.navLabel}
        </Link>
        <Link href={localizeHref(locale, '/ai-provider')}>
          {aiProviderCopy.title}
        </Link>
        <Link href={localizeHref(locale, '/content-calendar')}>
          {contentCalendarCopy.title}
        </Link>
        <Link href={localizeHref(locale, '/social-publishing')}>
          {socialPublishingCopy.title}
        </Link>
      </p>
    </section>
  );
}
