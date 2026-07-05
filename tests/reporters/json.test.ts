import { describe, expect, it } from "vitest";
import { reportJson } from "../../src/reporters/json.js";
import { scoreRisk } from "../../src/scoring/risk-score.js";
import type { Finding } from "../../src/findings/types.js";

const findings: Finding[] = [
  { ruleId: "any-type", severity: "medium", message: "Added TypeScript \"any\": const x: any = 1;" },
  { ruleId: "ts-ignore", severity: "high", message: "Added @ts-ignore: // @ts-ignore" },
];

describe("reportJson", () => {
  it("produces valid JSON", () => {
    const risk = scoreRisk(findings);
    const output = reportJson(findings, risk);

    expect(() => JSON.parse(output)).not.toThrow();
  });

  it("includes findings and risk in the parsed output", () => {
    const risk = scoreRisk(findings);
    const parsed = JSON.parse(reportJson(findings, risk));

    expect(parsed.findings).toEqual(findings);
    expect(parsed.risk).toEqual(risk);
  });

  it("includes top-level finding counts", () => {
    const risk = scoreRisk(findings);
    const parsed = JSON.parse(reportJson(findings, risk));

    expect(parsed.findingCount).toBe(risk.findingCount);
    expect(parsed.highCount).toBe(risk.highCount);
    expect(parsed.mediumCount).toBe(risk.mediumCount);
    expect(parsed.lowCount).toBe(risk.lowCount);
  });

  it("handles an empty findings list", () => {
    const risk = scoreRisk([]);
    const parsed = JSON.parse(reportJson([], risk));

    expect(parsed.findings).toEqual([]);
    expect(parsed.findingCount).toBe(0);
  });
});
