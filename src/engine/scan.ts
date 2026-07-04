import type { Finding } from "../findings/types.js";
import { rules } from "../rules/index.js";

export function scan(diff: string): Finding[] {
  const findings: Finding[] = [];

  const addedLines = diff
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"));

  for (const line of addedLines) {
    const clean = line.slice(1).trim();

    for (const rule of rules) {
      if (rule.check(clean)) {
        findings.push({
          ruleId: rule.id,
          severity: rule.severity,
          message: `${rule.description}: ${clean}`,
          line: clean,
        });
      }
    }
  }

  return findings;
}
