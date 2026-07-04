import { Command } from "commander";
import { getGitDiff } from "./git/diff.js";
import { scanDiff } from "./scan/scanDiff.js";
import type { Finding } from "./findings/types.js";

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

    const findings = scanDiff(diff);
    printFindings(findings);

    if (findings.some((finding) => finding.severity === "high")) {
      process.exitCode = 1;
    }
  });

program.parse();
