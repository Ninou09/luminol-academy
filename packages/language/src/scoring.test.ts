import { describe, expect, it } from "vitest";
import { submitPlacement } from "./assessment";
import { recommendCourse } from "./recommendations";
import { calculatePlacementResult, determineCefrLevel } from "./scoring";

const completeScores = [
  { skill: "reading", rawScore: 80, maxScore: 100, answeredItems: 20, totalItems: 20 },
  { skill: "listening", rawScore: 70, maxScore: 100, answeredItems: 20, totalItems: 20 },
  { skill: "speaking", rawScore: 50, maxScore: 100, answeredItems: 10, totalItems: 10 },
  { skill: "writing", rawScore: 55, maxScore: 100, answeredItems: 10, totalItems: 10 },
  { skill: "grammar", rawScore: 60, maxScore: 100, answeredItems: 20, totalItems: 20 },
  { skill: "vocabulary", rawScore: 70, maxScore: 100, answeredItems: 20, totalItems: 20 },
] as const;

describe("determineCefrLevel", () => {
  it.each([
    [0, "A1"],
    [42.99, "A1"],
    [43, "A2"],
    [57.99, "A2"],
    [58, "B1"],
    [71.99, "B1"],
    [72, "B2"],
    [83.99, "B2"],
    [84, "C1"],
    [91.99, "C1"],
    [92, "C2"],
    [100, "C2"],
  ])("maps %s to %s", (score, level) => {
    expect(determineCefrLevel(score)).toBe(level);
  });

  it("clamps values outside the valid percentage range", () => {
    expect(determineCefrLevel(-10)).toBe("A1");
    expect(determineCefrLevel(140)).toBe("C2");
  });
});

describe("calculatePlacementResult", () => {
  it("calculates a weighted CEFR result and diagnostics", () => {
    const result = calculatePlacementResult(completeScores);

    expect(result.score).toBe(64);
    expect(result.overall).toBe("B1");
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.strengths).toContain("reading");
    expect(result.weaknesses).toEqual(["speaking", "writing"]);
  });

  it("keeps skill percentages available for per-skill CEFR persistence", () => {
    const result = calculatePlacementResult(completeScores);

    expect(
      result.skills.map(({ skill, percentage }) => ({
        skill,
        level: determineCefrLevel(percentage),
      })),
    ).toEqual([
      { skill: "reading", level: "B2" },
      { skill: "listening", level: "B1" },
      { skill: "speaking", level: "A2" },
      { skill: "writing", level: "A2" },
      { skill: "grammar", level: "B1" },
      { skill: "vocabulary", level: "B1" },
    ]);
  });

  it("requires every language skill exactly once", () => {
    expect(() => calculatePlacementResult(completeScores.slice(0, 5))).toThrow(
      /every language skill/,
    );
  });
});

describe("recommendCourse", () => {
  it("selects the active course matching the resulting CEFR level", () => {
    const result = calculatePlacementResult(completeScores);
    const recommendation = recommendCourse(result, [
      { id: "a2", level: "A2", title: "English A2", active: true },
      { id: "b1", level: "B1", title: "English B1 Intensive", active: true },
    ]);

    expect(recommendation.courseId).toBe("b1");
    expect(recommendation.prioritySkills).toEqual(["speaking", "writing"]);
  });
});

describe("placement lifecycle", () => {
  it("allows a draft attempt to be submitted", () => {
    expect(submitPlacement("draft")).toBe("submitted");
  });

  it("rejects submitting an already completed attempt", () => {
    expect(() => submitPlacement("completed")).toThrow(/Invalid placement transition/);
  });
});
