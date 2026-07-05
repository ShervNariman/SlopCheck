import { describe, expect, it } from "vitest";
import { scoreRisk } from "../../src/scoring/risk-score.js";
import type { Finding } from "../../src/findings/types.js";

function makeFinding(severity: Finding["severity"]): Finding {
  return { ruleId: `${severity}-rule`, severity, message: "test finding" };
}

describe("scoreRisk", () => {
  it("returns score 0 and level low when there are no findings", () => {
    const result = scoreRisk([]);
    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
  });

  it("increases the score by 10 for a single low-severity finding", () => {
    const result = scoreRisk([makeFinding("low")]);
    expect(result.score).toBe(10);
  });

  it("increases the score by 20 for a single medium-severity finding", () => {
    const result = scoreRisk([makeFinding("medium")]);
    expect(result.score).toBe(20);
  });

  it("increases the score by 40 for a single high-severity finding", () => {
    const result = scoreRisk([makeFinding("high")]);
    expect(result.score).toBe(40);
  });

  it("caps the score at 100 even with many high-severity findings", () => {
    const result = scoreRisk([makeFinding("high"), makeFinding("high"), makeFinding("high")]);
    expect(result.score).toBe(100);
  });

  it("maps scores in the 0-24 range to level low", () => {
    const result = scoreRisk([makeFinding("low")]);
    expect(result.score).toBe(10);
    expect(result.level).toBe("low");
  });

  it("maps scores in the 25-59 range to level medium", () => {
    const result = scoreRisk([makeFinding("medium"), makeFinding("low")]);
    expect(result.score).toBe(30);
    expect(result.level).toBe("medium");
  });

  it("maps scores in the 60-100 range to level high", () => {
    const result = scoreRisk([makeFinding("high"), makeFinding("medium")]);
    expect(result.score).toBe(60);
    expect(result.level).toBe("high");
  });

  it("reports accurate per-severity counts", () => {
    const result = scoreRisk([
      makeFinding("high"),
      makeFinding("medium"),
      makeFinding("medium"),
      makeFinding("low"),
    ]);

    expect(result.findingCount).toBe(4);
    expect(result.highCount).toBe(1);
    expect(result.mediumCount).toBe(2);
    expect(result.lowCount).toBe(1);
  });
});
