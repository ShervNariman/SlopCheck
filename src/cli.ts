import { Command } from "commander";
import { getGitDiff } from "./git/diff.js";
import { scan } from "./engine/scan.js";
import { scoreRisk } from "./scoring/risk-score.js";
import { reportConsole } from "./reporters/console.js";
import { reportJson } from "./reporters/json.js";

const program = new Command();

program
  .name("slopcheck")
  .description("Catch risky AI-generated code changes before they land.")
  .version("0.1.0");

program
  .command("diff")
  .description("Scan the current git diff for risky changes.")
  .option("--format <format>", "output format: console or json", "console")
  .option("--json", "shorthand for --format json")
  .action(async (options: { format: string; json?: boolean }) => {
    const format = options.json ? "json" : options.format;

    const diff = await getGitDiff();

    if (!diff.trim()) {
      console.log("No git diff found. Make a code change first, then run SlopCheck.");
      return;
    }

    const findings = scan(diff);
    const risk = scoreRisk(findings);

    if (format === "json") {
      console.log(reportJson(findings, risk));
    } else {
      reportConsole(findings, risk);
    }

    const hasHighSeverityFinding = findings.some((finding) => finding.severity === "high");
    if (hasHighSeverityFinding || risk.level === "high") {
      process.exitCode = 1;
    }
  });

program.parse();
