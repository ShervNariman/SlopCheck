import { describe, expect, it } from "vitest";
import { scan } from "../../src/engine/scan.js";

describe("scan", () => {
  it("returns an empty array when the diff has no risky lines", () => {
    const diff = ["diff --git a/foo.ts b/foo.ts", "+const x = 1;", "+function safe() {}"].join(
      "\n",
    );

    expect(scan(diff)).toEqual([]);
  });

  it("aggregates findings from multiple rules across multiple lines", () => {
    const diff = [
      "diff --git a/foo.ts b/foo.ts",
      "+const x: any = 1;",
      "+// TODO: fix this later",
      "+console.log(x);",
    ].join("\n");

    const findings = scan(diff);

    expect(findings).toHaveLength(3);
    expect(findings.map((f) => f.ruleId).sort()).toEqual(
      ["any-type", "console-log", "todo-fixme-hack"].sort(),
    );
  });

  it("ignores removed lines and the +++ file header", () => {
    const diff = ["diff --git a/foo.ts b/foo.ts", "+++ b/foo.ts", "-const x: any = 1;"].join(
      "\n",
    );

    expect(scan(diff)).toEqual([]);
  });

  it("produces structured Finding fields matching the triggering rule", () => {
    const diff = ["diff --git a/foo.ts b/foo.ts", "+  // @ts-ignore"].join("\n");

    const findings = scan(diff);

    expect(findings).toHaveLength(1);
    const [finding] = findings;
    expect(finding.ruleId).toBe("ts-ignore");
    expect(finding.severity).toBe("high");
    expect(finding.message).toBe("Added @ts-ignore: // @ts-ignore");
    expect(finding.line).toBe("// @ts-ignore");
  });
});
