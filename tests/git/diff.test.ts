import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { execa } from "execa";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getGitDiff } from "../../src/git/diff.js";

describe("getGitDiff", () => {
  let repoDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    repoDir = mkdtempSync(join(tmpdir(), "slopcheck-diff-test-"));
    process.chdir(repoDir);

    await execa("git", ["init", "-q"]);
    await execa("git", ["config", "user.email", "test@test.com"]);
    await execa("git", ["config", "user.name", "Test"]);

    writeFileSync(join(repoDir, "foo.ts"), "export function safe() { return 1; }\n");
    await execa("git", ["add", "foo.ts"]);
    await execa("git", ["commit", "-q", "-m", "init"]);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(repoDir, { recursive: true, force: true });
  });

  it("returns an empty diff on a clean tree with no base ref", async () => {
    const diff = await getGitDiff();
    expect(diff.trim()).toBe("");
  });

  it("diffs against a base ref when one is provided", async () => {
    const baseSha = (await execa("git", ["rev-parse", "HEAD"])).stdout.trim();

    writeFileSync(join(repoDir, "foo.ts"), "export function risky() { const x: any = 1; }\n");
    await execa("git", ["add", "foo.ts"]);
    await execa("git", ["commit", "-q", "-m", "add risky change"]);

    const diff = await getGitDiff(baseSha);

    expect(diff).toContain("+export function risky() { const x: any = 1; }");
  });

  it("ignores staged changes when a base ref is provided and there is no diff against it", async () => {
    const diff = await getGitDiff("HEAD");
    expect(diff.trim()).toBe("");
  });
});
