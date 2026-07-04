import type { Finding } from "../findings/types.js";

export type RiskLevel = "low" | "medium" | "high";

export interface RiskResult {
  score: number;
  level: RiskLevel;
  summary: string;
  findingCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

/**
 * Per-severity score weights. Deterministic and intentionally simple (ADR-008): no
 * per-rule overrides, no configurable weights. A single high-severity finding (+40) is
 * meant to stand out clearly above a handful of low-severity ones.
 */
const SEVERITY_WEIGHT: Record<Finding["severity"], number> = {
  high: 40,
  medium: 20,
  low: 10,
};

const MAX_SCORE = 100;

function levelFromScore(score: number): RiskLevel {
  if (score >= 60) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export function scoreRisk(findings: Finding[]): RiskResult {
  const highCount = findings.filter((f) => f.severity === "high").length;
  const mediumCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low").length;
  const findingCount = findings.length;

  if (findingCount === 0) {
    return {
      score: 0,
      level: "low",
      summary: "No risky patterns detected.",
      findingCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
    };
  }

  const rawScore =
    highCount * SEVERITY_WEIGHT.high +
    mediumCount * SEVERITY_WEIGHT.medium +
    lowCount * SEVERITY_WEIGHT.low;
  const score = Math.min(rawScore, MAX_SCORE);
  const level = levelFromScore(score);

  const summary = `${findingCount} potential issue(s) found.`;

  return { score, level, summary, findingCount, highCount, mediumCount, lowCount };
}
