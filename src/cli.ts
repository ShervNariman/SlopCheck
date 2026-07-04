import { Command } from "commander";
import { execa } from "execa";

const program = new Command();

type Finding = {
  severity: "high" | "medium" | "low";
  message: string;
};

async function getGitDiff(): Promise<string> {
  const cached = await execa("git", ["diff", "--cached", "--unified=0"], { reject: false });
  if (cached.stdout.trim()) return cached.stdout;

  const unstaged = await execa("git", ["diff", "--unified=0"], { reject: false });
  return unstaged.stdout;
}

function scanDiff(diff: string): Finding[] {
  const findings: Finding[] = [];

  const addedLines = diff
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"));

  for (const line of addedLines) {
    const clean = line.slice(1).trim();

    if (/\bany\b/.test(clean)) {
      findings.push({ severity: "medium", message: `Added TypeScript "any": ${clean}` });
    }

    if (clean.includes("@ts-ignore")) {
      findings.push({ severity: "high", message: `Added @ts-ignore: ${clean}` });
    }

    if (/TODO|FIXME|HACK/i.test(clean)) {
      findings.push({ severity: "low", message: `Added TODO/FIXME/HACK: ${clean}` });
    }

    if (/catch\s*\([^)]*\)\s*\{?\s*$/.test(clean)) {
      findings.push({ severity: "medium", message: `Added broad catch block: ${clean}` });
    }

    if (clean.includes("console.log")) {
      findings.push({ severity: "low", message: `Added console.log: ${clean}` });
    }
  }

  return findings;
}

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
