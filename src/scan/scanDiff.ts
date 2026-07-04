import type { Finding } from "../findings/types.js";

export function scanDiff(diff: string): Finding[] {
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
