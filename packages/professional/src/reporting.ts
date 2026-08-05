import { z } from 'zod';

export const completionRecordSchema = z.object({
  learnerId: z.string().min(1),
  enrollmentId: z.string().min(1),
  completedModules: z.number().int().min(0),
  totalModules: z.number().int().positive(),
  approvedProjects: z.number().int().min(0),
  requiredProjects: z.number().int().min(0),
  assessmentScore: z.number().min(0).max(100).nullable(),
});

export type CompletionRecord = z.infer<typeof completionRecordSchema>;

export type CompletionEligibility = {
  eligible: boolean;
  completionPercentage: number;
  evidence: {
    modulesComplete: boolean;
    projectsComplete: boolean;
    assessmentPassed: boolean;
  };
  missingRequirements: string[];
};

export function evaluateCompletionEligibility(
  input: CompletionRecord,
  passingScore = 70,
): CompletionEligibility {
  const record = completionRecordSchema.parse(input);
  const modulesComplete = record.completedModules >= record.totalModules;
  const projectsComplete = record.approvedProjects >= record.requiredProjects;
  const assessmentPassed =
    record.assessmentScore !== null && record.assessmentScore >= passingScore;
  const completionPercentage = Math.min(
    100,
    Math.round((record.completedModules / record.totalModules) * 100),
  );

  const missingRequirements: string[] = [];
  if (!modulesComplete)
    missingRequirements.push('Complete all required modules');
  if (!projectsComplete)
    missingRequirements.push('Obtain approval for all required projects');
  if (!assessmentPassed)
    missingRequirements.push(
      `Achieve an assessment score of at least ${passingScore}`,
    );

  return {
    eligible: modulesComplete && projectsComplete && assessmentPassed,
    completionPercentage,
    evidence: {
      modulesComplete,
      projectsComplete,
      assessmentPassed,
    },
    missingRequirements,
  };
}

export function summarizeCohortCompletion(
  records: readonly CompletionRecord[],
) {
  const validated = records.map((record) =>
    completionRecordSchema.parse(record),
  );
  if (validated.length === 0) {
    return {
      learnerCount: 0,
      eligibleCount: 0,
      completionRate: 0,
      averageModuleCompletion: 0,
    };
  }

  const evaluations = validated.map((record) =>
    evaluateCompletionEligibility(record),
  );
  const eligibleCount = evaluations.filter(({ eligible }) => eligible).length;
  const averageModuleCompletion = Math.round(
    evaluations.reduce(
      (total, result) => total + result.completionPercentage,
      0,
    ) / evaluations.length,
  );

  return {
    learnerCount: validated.length,
    eligibleCount,
    completionRate: Math.round((eligibleCount / validated.length) * 100),
    averageModuleCompletion,
  };
}
