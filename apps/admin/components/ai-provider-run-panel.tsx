'use client';

import { useActionState } from 'react';

import {
  runAiProviderCampaignAnalysisAction,
  runAiProviderRecommendationsAction,
  runAiProviderSummaryAction,
  type AiProviderRunState,
} from '../app/ai-provider/actions';

const INITIAL_STATE: AiProviderRunState = { status: 'idle' };

type TaskCopy = {
  title: string;
  intro: string;
  action: string;
};

type AiProviderRunPanelProps = {
  summary: TaskCopy;
  recommendations: TaskCopy;
  campaignAnalysis: TaskCopy;
  running: string;
  advisoryLabel: string;
  noSideEffects: string;
  blockedResult: string;
  failedResult: string;
  errorCodeLabel: string;
};

function TaskResult({
  state,
  advisoryLabel,
  blockedResult,
  failedResult,
  errorCodeLabel,
}: {
  state: AiProviderRunState;
  advisoryLabel: string;
  blockedResult: string;
  failedResult: string;
  errorCodeLabel: string;
}) {
  if (state.status === 'succeeded') {
    return (
      <article className="admin-panel" aria-live="polite">
        <h3>{advisoryLabel}</h3>
        <p style={{ whiteSpace: 'pre-wrap' }} dir="auto">
          {state.text}
        </p>
        <small dir="auto">{state.model}</small>
      </article>
    );
  }

  if (state.status === 'blocked' || state.status === 'failed') {
    return (
      <article className="admin-panel" aria-live="polite">
        <p>{state.status === 'blocked' ? blockedResult : failedResult}</p>
        <small dir="ltr">
          {errorCodeLabel}: {state.errorCode}
        </small>
      </article>
    );
  }

  return null;
}

export function AiProviderRunPanel({
  summary,
  recommendations,
  campaignAnalysis,
  running,
  advisoryLabel,
  noSideEffects,
  blockedResult,
  failedResult,
  errorCodeLabel,
}: AiProviderRunPanelProps) {
  const [summaryState, summaryAction, summaryPending] = useActionState(
    runAiProviderSummaryAction,
    INITIAL_STATE,
  );
  const [recommendationsState, recommendationsAction, recommendationsPending] =
    useActionState(runAiProviderRecommendationsAction, INITIAL_STATE);
  const [campaignState, campaignAction, campaignPending] = useActionState(
    runAiProviderCampaignAnalysisAction,
    INITIAL_STATE,
  );

  const tasks = [
    {
      key: 'summary',
      copy: summary,
      state: summaryState,
      formAction: summaryAction,
      pending: summaryPending,
    },
    {
      key: 'recommendations',
      copy: recommendations,
      state: recommendationsState,
      formAction: recommendationsAction,
      pending: recommendationsPending,
    },
    {
      key: 'campaign-analysis',
      copy: campaignAnalysis,
      state: campaignState,
      formAction: campaignAction,
      pending: campaignPending,
    },
  ] as const;

  return (
    <section className="admin-panel" aria-label={summary.title}>
      <div className="panel-heading">
        <div>
          <h2>{summary.title}</h2>
          <p>{noSideEffects}</p>
        </div>
      </div>

      <div className="compact-list">
        {tasks.map((task) => (
          <article key={task.key} style={{ alignItems: 'start' }}>
            <div>
              <strong>{task.copy.title}</strong>
              <p>{task.copy.intro}</p>
              <form action={task.formAction}>
                <button type="submit" disabled={task.pending}>
                  {task.pending ? running : task.copy.action}
                </button>
              </form>
            </div>
            <TaskResult
              state={task.state}
              advisoryLabel={advisoryLabel}
              blockedResult={blockedResult}
              failedResult={failedResult}
              errorCodeLabel={errorCodeLabel}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
