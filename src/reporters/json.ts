import type { Finding } from "../findings/types.js";
import type { RiskResult } from "../scoring/risk-score.js";

export interface JsonReport {
  findings: Finding[];
  risk: RiskResult;
  findingCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export function reportJson(findings: Finding[], risk: RiskResult): string {
  const report: JsonReport = {
    findings,
    risk,
    findingCount: risk.findingCount,
    highCount: risk.highCount,
    mediumCount: risk.mediumCount,
    lowCount: risk.lowCount,
  };

  return JSON.stringify(report, null, 2);
}
