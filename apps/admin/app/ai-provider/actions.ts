'use server';

import { requirePermission } from '@luminol/auth';
import { db, runAiProviderTask } from '@luminol/database';
import { revalidatePath } from 'next/cache';

import { getOperationsDashboard } from '../../lib/operations.server';

export type AiProviderRunState =
  | { status: 'idle' }
  | { status: 'succeeded'; text: string; model: string }
  | { status: 'blocked' | 'failed'; errorCode: string };

export async function runAiProviderSummaryAction(
  _previousState: AiProviderRunState,
  _formData: FormData,
): Promise<AiProviderRunState> {
  void _previousState;
  void _formData;
  await requirePermission('academy:manage');

  try {
    const operations = await getOperationsDashboard();
    const result = await runAiProviderTask(db, {
      taskClass: 'SUMMARIZE_OPERATIONAL_STATE',
      metrics: {
        activeEnquiries: operations.summary.activeEnquiries,
        unassignedActiveEnquiries: operations.summary.unassignedActiveEnquiries,
        enquiriesLast30Days: operations.summary.enquiriesLast30Days,
        newEnquiries: operations.summary.newEnquiries,
        pastDueFollowUps:
          operations.activeEnquiryFollowUpTiming.buckets.pastDue,
        missingFollowUpPlans:
          operations.activeEnquiryFollowUpTiming.buckets.missingPlan,
        missingClosedOutcomesLast30Days:
          operations.enquiryOutcomeCoverageLast30Days.missingTotal,
        ownerCoveragePercent:
          operations.enquiryWorkflowCoverageLast30Days.ownerPercent,
        followUpCoveragePercent:
          operations.enquiryWorkflowCoverageLast30Days.followUpPercent,
        qualificationCoveragePercent:
          operations.enquiryWorkflowCoverageLast30Days.qualificationPercent,
      },
    });

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
