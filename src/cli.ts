import { Command } from "commander";
import { getGitDiff } from "./git/diff.js";
import { scan } from "./engine/scan.js";
import type { Finding } from "./findings/types.js";
import { scoreRisk, type RiskResult } from "./scoring/risk-score.js";

const program = new Command();

function printFindings(findings: Finding[]) {
  if (findings.length === 0) {
    console.log("SlopCheck found no obvious risky AI-generated patch patterns.");
    return;
  }

  console.log(`\nSlopCheck found ${findings.length} potential issue(s):\n`);

  for (const finding of findings) {
    console.log(`[${finding.severity.toUpperCase()}] ${finding.message}`);
  }

  console.log("");
}

function printRiskResult(risk: RiskResult) {
  console.log(`Risk score: ${risk.score}/100 (${risk.level}) — ${risk.summary}`);
}

program
  .name("slopcheck")
  .description("Catch risky AI-generated code changes before they land.")
  .version("0.1.0");

program
  .command("diff")
  .description("Scan the current git diff for risky changes.")
  .action(async () => {
    const diff = await getGitDiff();

    if (!diff.trim()) {
      console.log("No git diff found. Make a code change first, then run SlopCheck.");
      return;
    }

    const findings = scan(diff);
    printFindings(findings);

    const risk = scoreRisk(findings);
    printRiskResult(risk);

    const hasHighSeverityFinding = findings.some((finding) => finding.severity === "high");
    if (hasHighSeverityFinding || risk.level === "high") {
      process.exitCode = 1;
    }
  });

program.parse();
