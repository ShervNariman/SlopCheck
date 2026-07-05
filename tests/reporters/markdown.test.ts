import { describe, expect, it } from "vitest";
import { reportMarkdown } from "../../src/reporters/markdown.js";
import { scoreRisk } from "../../src/scoring/risk-score.js";
import type { Finding } from "../../src/findings/types.js";

const findings: Finding[] = [
  { ruleId: "any-type", severity: "medium", message: "Added TypeScript \"any\": const x: any = 1;" },
  { ruleId: "ts-ignore", severity: "high", message: "Added @ts-ignore: // @ts-ignore" },
];

describe("reportMarkdown", () => {
  it("includes the SlopCheck heading", () => {
    const risk = scoreRisk(findings);
    const output = reportMarkdown(findings, risk);

    expect(output).toContain("## SlopCheck");
  });

  it("includes the risk score and level", () => {
    const risk = scoreRisk(findings);
    const output = reportMarkdown(findings, risk);

    expect(output).toContain(`**Risk score:** ${risk.score}/100`);
    expect(output).toContain(`**Risk level:** ${risk.level}`);
  });

  it("includes the finding-count table values", () => {
    const risk = scoreRisk(findings);
    const output = reportMarkdown(findings, risk);

    expect(output).toContain(`| Findings | ${risk.findingCount} |`);
    expect(output).toContain(`| High | ${risk.highCount} |`);
    expect(output).toContain(`| Medium | ${risk.mediumCount} |`);
    expect(output).toContain(`| Low | ${risk.lowCount} |`);
  });

  it("includes each finding's severity, ruleId, and message", () => {
    const risk = scoreRisk(findings);
    const output = reportMarkdown(findings, risk);

    for (const finding of findings) {
      expect(output).toContain(`**[${finding.severity.toUpperCase()}]**`);
      expect(output).toContain(`\`${finding.ruleId}\``);
      expect(output).toContain(finding.message);
    }
  });

  it("reports no risky patterns detected when there are no findings", () => {
    const risk = scoreRisk([]);
    const output = reportMarkdown([], risk);

    expect(output).toContain("No risky patterns detected.");
  });
});
