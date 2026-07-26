import {
  CEFR_THRESHOLDS,
  LANGUAGE_SKILLS,
  SKILL_WEIGHTS,
} from "./constants";
import type {
  CefrLevel,
  LanguageSkill,
  PlacementResult,
  SkillScore,
  SkillScoreInput,
} from "./types";

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export function determineCefrLevel(score: number): CefrLevel {
  const normalized = clamp(score, 0, 100);
  return CEFR_THRESHOLDS.find(({ minimum }) => normalized >= minimum)?.level ?? "A1";
}

export function normalizeSkillScore(input: SkillScoreInput): SkillScore {
  if (input.maxScore <= 0) {
    throw new Error("maxScore must be greater than zero");
  }

  if (input.rawScore < 0 || input.rawScore > input.maxScore) {
    throw new Error("rawScore must be between zero and maxScore");
  }

  if (
    input.totalItems <= 0 ||
    input.answeredItems < 0 ||
    input.answeredItems > input.totalItems
  ) {
    throw new Error("answeredItems must be between zero and totalItems");
  }

  const percentage = (input.rawScore / input.maxScore) * 100;
  const weightedContribution = percentage * SKILL_WEIGHTS[input.skill];

  return {
    ...input,
    percentage,
    weightedContribution,
  };
}

function calculateConfidence(skills: SkillScore[]): number {
  const completion =
    skills.reduce(
      (sum, skill) => sum + skill.answeredItems / skill.totalItems,
      0,
    ) / skills.length;

  const mean =
    skills.reduce((sum, skill) => sum + skill.percentage, 0) / skills.length;
  const variance =
    skills.reduce(
      (sum, skill) => sum + Math.pow(skill.percentage - mean, 2),
      0,
    ) / skills.length;
  const consistency = 1 - clamp(Math.sqrt(variance) / 50, 0, 1);

  return Number(clamp(completion * 0.75 + consistency * 0.25, 0, 1).toFixed(2));
}

export function calculatePlacementResult(
  inputs: readonly SkillScoreInput[],
): PlacementResult {
  const inputSkills = new Set(inputs.map(({ skill }) => skill));
  const missingSkills = LANGUAGE_SKILLS.filter((skill) => !inputSkills.has(skill));

  if (inputs.length !== LANGUAGE_SKILLS.length || missingSkills.length > 0) {
    throw new Error(`Scores are required for every language skill: ${missingSkills.join(", ")}`);
  }

  if (inputSkills.size !== inputs.length) {
    throw new Error("Each language skill may appear only once");
  }

  const skills = inputs.map(normalizeSkillScore);
  const score = Number(
    skills.reduce((sum, skill) => sum + skill.weightedContribution, 0).toFixed(2),
  );

  const strengths = skills
    .filter((skill) => skill.percentage >= 75)
    .map((skill) => skill.skill);
  const weaknesses = skills
    .filter((skill) => skill.percentage < 58)
    .sort((left, right) => left.percentage - right.percentage)
    .map((skill) => skill.skill);

  return {
    overall: determineCefrLevel(score),
    confidence: calculateConfidence(skills),
    score,
    skills,
    strengths,
    weaknesses,
  };
}

export function getSkillPercentage(
  result: PlacementResult,
  skill: LanguageSkill,
): number {
  return result.skills.find((entry) => entry.skill === skill)?.percentage ?? 0;
}
