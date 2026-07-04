import type { Finding } from "../findings/types.js";
import type { RiskResult } from "../scoring/risk-score.js";

export function reportConsole(findings: Finding[], risk: RiskResult): void {
  if (findings.length === 0) {
    console.log("SlopCheck found no obvious risky AI-generated patch patterns.");
  } else {
    console.log(`\nSlopCheck found ${findings.length} potential issue(s):\n`);

    for (const finding of findings) {
      console.log(`[${finding.severity.toUpperCase()}] ${finding.message}`);
    }

    console.log("");
  }

  console.log(`Risk score: ${risk.score}/100 (${risk.level}) — ${risk.summary}`);
}
