'use server';

import { requirePermission } from '@luminol/auth';
import { db, runAiProviderTask } from '@luminol/database';
import type { AiProviderTaskClass } from '@luminol/validation/ai-provider';
import { revalidatePath } from 'next/cache';

import {
  buildAiProviderCampaignMetrics,
  buildAiProviderOperationalMetrics,
} from '../../lib/ai-provider-metrics';
import { getOperationsDashboard } from '../../lib/operations.server';

export type AiProviderRunState =
  | { status: 'idle' }
  | { status: 'succeeded'; text: string; model: string }
  | { status: 'blocked' | 'failed'; errorCode: string };

async function executeBoundedAiProviderTask(
  taskClass: AiProviderTaskClass,
  metrics: Record<string, number>,
): Promise<AiProviderRunState> {
  try {
    const result = await runAiProviderTask(db, { taskClass, metrics });
    revalidatePath('/ai-provider');

    if (result.status === 'SUCCEEDED') {
      return {
        status: 'succeeded',
        text: result.text,
        model: result.model,
      };
    }

    return {
      status: result.status === 'BLOCKED' ? 'blocked' : 'failed',
      errorCode: result.errorCode,
    };
  } catch {
    return { status: 'failed', errorCode: 'AI_GATEWAY_CONFIGURATION_INVALID' };
  }
}

export async function runAiProviderSummaryAction(
  _previousState: AiProviderRunState,
  _formData: FormData,
): Promise<AiProviderRunState> {
  void _previousState;
  void _formData;
  await requirePermission('academy:manage');
  const operations = await getOperationsDashboard();
  return executeBoundedAiProviderTask(
    'SUMMARIZE_OPERATIONAL_STATE',
    buildAiProviderOperationalMetrics(operations),
  );
}

export async function runAiProviderRecommendationsAction(
  _previousState: AiProviderRunState,
  _formData: FormData,
): Promise<AiProviderRunState> {
  void _previousState;
  void _formData;
  await requirePermission('academy:manage');
  const operations = await getOperationsDashboard();
  return executeBoundedAiProviderTask(
    'DRAFT_OPERATOR_RECOMMENDATIONS',
    buildAiProviderOperationalMetrics(operations),
  );
}

export async function runAiProviderCampaignAnalysisAction(
  _previousState: AiProviderRunState,
  _formData: FormData,
): Promise<AiProviderRunState> {
  void _previousState;
  void _formData;
  await requirePermission('academy:manage');
  const operations = await getOperationsDashboard();
  return executeBoundedAiProviderTask(
    'ANALYZE_CAMPAIGN_METRICS',
    buildAiProviderCampaignMetrics(operations),
  );
}
