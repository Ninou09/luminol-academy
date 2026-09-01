import {
  formatLocalizedNumber,
  localizeHref,
  type Locale,
} from '@luminol/localization';
import Link from 'next/link';

import {
  getAiOperationsBriefCopy,
  getAiOperationsBriefItemText,
} from '../lib/ai-operations-brief-localization';
import {
  buildAiOperationsBrief,
  type AiOperationsBriefInput,
} from '../lib/ai-operations-brief';

type AiOperationsBriefPanelProps = {
  locale: Locale;
  operations: AiOperationsBriefInput;
};

export function AiOperationsBriefPanel({
  locale,
  operations,
}: AiOperationsBriefPanelProps) {
  const copy = getAiOperationsBriefCopy(locale);
  const brief = buildAiOperationsBrief(operations);
  const number = (value: number) => formatLocalizedNumber(value, locale);

  return (
    <section className="admin-panel" aria-label={copy.title}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        <span>{copy.mode}</span>
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
          {brief.items.map((item) => {
            const itemCount = number(item.count);
            const text = getAiOperationsBriefItemText(copy, item, itemCount);

            return (
              <article key={`${item.kind}:${item.query}`}>
                <div>
                  <h3>{text.title}</h3>
                  <p>{text.body}</p>
                </div>
                <div>
                  <span className="data-status">{itemCount}</span>
                  <Link
                    className="data-status"
                    href={localizeHref(locale, `/enquiries?${item.query}`)}
                  >
                    {copy.action}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
