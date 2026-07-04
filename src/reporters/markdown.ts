import type { Finding } from "../findings/types.js";
import type { RiskResult } from "../scoring/risk-score.js";

export function reportMarkdown(findings: Finding[], risk: RiskResult): string {
  const lines: string[] = [];

  lines.push("## SlopCheck");
  lines.push("");
  lines.push(`**Risk score:** ${risk.score}/100`);
  lines.push(`**Risk level:** ${risk.level}`);
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("| --- | --- |");
  lines.push(`| Findings | ${risk.findingCount} |`);
  lines.push(`| High | ${risk.highCount} |`);
  lines.push(`| Medium | ${risk.mediumCount} |`);
  lines.push(`| Low | ${risk.lowCount} |`);
  lines.push("");

  if (findings.length === 0) {
    lines.push("No risky patterns detected.");
  } else {
    lines.push("### Findings");
    lines.push("");

    for (const finding of findings) {
      lines.push(
        `- **[${finding.severity.toUpperCase()}]** (\`${finding.ruleId}\`) ${finding.message}`,
      );
    }
  }

  return lines.join("\n");
}
