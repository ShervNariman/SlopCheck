import { afterEach, describe, expect, it, vi } from "vitest";
import { reportConsole } from "../../src/reporters/console.js";
import { scoreRisk } from "../../src/scoring/risk-score.js";
import type { Finding } from "../../src/findings/types.js";

describe("reportConsole", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints the no-risky-patterns message when there are no findings", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const risk = scoreRisk([]);

    reportConsole([], risk);

    const output = logSpy.mock.calls.map((call) => call[0]).join("\n");
    expect(output).toContain("SlopCheck found no obvious risky AI-generated patch patterns.");
    expect(output).toContain(`Risk score: ${risk.score}/100 (${risk.level})`);
  });

  it("prints each finding and the risk score line", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const findings: Finding[] = [
      { ruleId: "ts-ignore", severity: "high", message: "Added @ts-ignore: // @ts-ignore" },
    ];
    const risk = scoreRisk(findings);

    reportConsole(findings, risk);

    const output = logSpy.mock.calls.map((call) => call[0]).join("\n");
    expect(output).toContain("SlopCheck found 1 potential issue(s):");
    expect(output).toContain("[HIGH] Added @ts-ignore: // @ts-ignore");
    expect(output).toContain(`Risk score: ${risk.score}/100 (${risk.level}) — ${risk.summary}`);
  });
});
