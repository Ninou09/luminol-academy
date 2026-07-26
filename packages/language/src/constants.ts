export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const LANGUAGE_SKILLS = [
  "reading",
  "listening",
  "speaking",
  "writing",
  "grammar",
  "vocabulary",
] as const;

export const SKILL_WEIGHTS = {
  reading: 0.2,
  listening: 0.2,
  speaking: 0.2,
  writing: 0.2,
  grammar: 0.1,
  vocabulary: 0.1,
} as const;

export const CEFR_THRESHOLDS = [
  { minimum: 92, level: "C2" },
  { minimum: 84, level: "C1" },
  { minimum: 72, level: "B2" },
  { minimum: 58, level: "B1" },
  { minimum: 43, level: "A2" },
  { minimum: 0, level: "A1" },
] as const;
