'use client';

import { useActionState } from 'react';

import {
  runAiProviderSummaryAction,
  type AiProviderRunState,
} from '../app/ai-provider/actions';

const INITIAL_STATE: AiProviderRunState = { status: 'idle' };

type AiProviderRunPanelProps = {
  title: string;
  intro: string;
  action: string;
  running: string;
  advisoryLabel: string;
  noSideEffects: string;
  blockedResult: string;
  failedResult: string;
  errorCodeLabel: string;
};

export function AiProviderRunPanel({
  title,
  intro,
  action,
  running,
  advisoryLabel,
  noSideEffects,
  blockedResult,
  failedResult,
  errorCodeLabel,
}: AiProviderRunPanelProps) {
  const [state, formAction, pending] = useActionState(
    runAiProviderSummaryAction,
    INITIAL_STATE,
  );

  return (
    <section className="admin-panel" aria-label={title}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
      </div>

      <form action={formAction}>
        <button type="submit" disabled={pending}>
          {pending ? running : action}
        </button>
      </form>

      <p>{noSideEffects}</p>

      {state.status === 'succeeded' ? (
        <article className="admin-panel" aria-live="polite">
          <h3>{advisoryLabel}</h3>
          <p style={{ whiteSpace: 'pre-wrap' }} dir="auto">
            {state.text}
          </p>
          <small dir="auto">{state.model}</small>
        </article>
      ) : null}

      {state.status === 'blocked' || state.status === 'failed' ? (
        <article className="admin-panel" aria-live="polite">
          <p>
            {state.status === 'blocked' ? blockedResult : failedResult}
          </p>
          <small dir="ltr">
            {errorCodeLabel}: {state.errorCode}
          </small>
        </article>
      ) : null}
    </section>
  );
}
