# Task 011: Add GitHub Action example

## Goal

Make SlopCheck usable in PR CI by adding minimal `--base <ref>` support to `slopcheck diff`, and
provide a practical, copy-pasteable GitHub Actions workflow example that runs SlopCheck against
a pull request's changes using the Markdown reporter.

## Context

Per `.ai-os/backlog.md` item 11 and `.ai-os/architecture.md`'s "GitHub Action (later)" note,
this is the first CI-facing piece of work. `src/git/diff.ts`'s `getGitDiff()` currently only
reads `git diff --cached --unified=0` (falling back to unstaged `git diff --unified=0`) — both
of which compare against the working tree's index/HEAD. In a GitHub Actions checkout, the tree
is clean after checkout, so neither of these picks up the PR's changes; SlopCheck needs a way to
diff against a base ref (e.g. `origin/main`) instead.

**Current state relevant to this task:**
- `src/cli.ts`: `diff` command has `--format <format>` (`console`/`json`/`markdown`, default
  `console`) and `--json` alias. No `--base` option exists yet.
- `src/git/diff.ts`: `getGitDiff(): Promise<string>` — no parameters, no base-ref support.
- `README.md`: documents local install/run/output but has no CI/GitHub Actions section.
- No `.github/workflows/` directory exists yet.
- Reporters (`console`, `json`, `markdown`) and rule engine are unaffected by this task — this
  only touches how the diff text is obtained and CLI wiring, per
  `.ai-os/decisions.md` (no scoring/rule changes) and `architecture.md`'s one-way dependency
  flow (`cli.ts` → git/engine/reporters).

## Acceptance Criteria

- [x] `slopcheck diff` supports a `--base <ref>` option.
- [x] When `--base <ref>` is provided, SlopCheck reads `git diff --unified=0 <ref>...HEAD`
      instead of the local staged/unstaged diff.
- [x] Existing local behavior (no `--base`) is unchanged: still reads staged diff, falling back
      to unstaged.
- [x] Existing `--format console`, `--format json`, `--format markdown`, and `--json` behavior
      is unchanged, and all work correctly together with `--base`.
- [x] A GitHub Actions workflow example exists at `.github/workflows/slopcheck.yml` that:
      - Triggers on `pull_request`.
      - Uses `actions/checkout` with `fetch-depth: 0`.
      - Sets up Node.
      - Installs dependencies with pnpm.
      - Builds the CLI (`pnpm build`).
      - Runs SlopCheck with `--base origin/${{ github.base_ref }} --format markdown`.
      - Writes the Markdown output to `$GITHUB_STEP_SUMMARY`.
      - Preserves SlopCheck's exit code so a risky PR fails the check.
      - Uses only free GitHub-hosted runners (no paid services).
- [x] README has a short, honest "GitHub Actions" section referencing the workflow file and
      explaining what it does.
- [x] No unnecessary dependencies are added.
- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes, and the existing 40 tests still pass.
- [x] A test or update to `getGitDiff` tests is added only if practical without
      over-engineering (e.g. a focused test for base-ref diffing behavior).
- [x] `pnpm tsx src/cli.ts diff --help` documents `--base`.
- [x] Manual verification (in a temporary, isolated git repo — not this repo) confirms:
      - A local clean tree still exits 0 with "No git diff found...".
      - A local risky diff (staged/unstaged) still works as before.
      - `--base <ref>` comparison works against a temporary repo with two commits (base commit +
        a second commit introducing risky patterns).
      - JSON and Markdown formats both work correctly together with `--base`.

## Done Means

This task is done only when `--base` works as specified, the workflow file exists and is
internally consistent with documented CLI flags, the README section is added, every acceptance
criterion above has been verified by actually running the relevant commands (not just inspecting
code), and a completion report is appended below.

## Files likely affected

- `src/cli.ts` — add `--base <ref>` option, pass it through to `getGitDiff`.
- `src/git/diff.ts` — add base-ref diffing support (e.g. an optional parameter).
- New: `.github/workflows/slopcheck.yml`
- `README.md` — new "GitHub Actions" section.
- New (optional): a focused test for `getGitDiff`'s base-ref behavior, if practical.
- `.ai-os/current-goal.md` — check off "GitHub Action example exists" and "011 — Add GitHub
  Action example" once complete.
- `.ai-os/architecture.md` — update the "Git diff reader" and "GitHub Action (later)" sections
  to reflect `--base` support and the now-existing workflow example.

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts diff --help`
- Manual verification in a temporary git repo (created under a temp directory, not this repo):
  - Clean tree, no `--base` → exit 0, "No git diff found..."
  - Staged/unstaged risky diff, no `--base` → matches existing behavior
  - Two commits, `slopcheck diff --base <first-commit-or-branch>` → detects findings introduced
    in the second commit
  - `--base <ref> --format json` and `--base <ref> --format markdown` → correct pure-format
    output

## Non-goals

- Do not prepare npm publishing (backlog item 12).
- Do not add automatic PR comment posting — the workflow only writes to `$GITHUB_STEP_SUMMARY`.
- Do not add a config file / rule allow-deny list.
- Do not add new rules.
- Do not change risk scoring logic (`src/scoring/risk-score.ts`).
- Do not add backend/auth/dashboard.
- Keep the `--base` implementation minimal — a single optional parameter and one additional git
  command, not a general-purpose ref-comparison framework.

## Suggested agent

Implementation Agent (for `--base` support), then Release Agent (for the workflow file and
README section)

---

## Completion Report

**Status:** Complete

**Agent:** Implementation (for `--base` support and its test), then Release (for the workflow
file and README section)

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `--base <ref>` option added to `slopcheck diff` — verified via
  `pnpm tsx src/cli.ts diff --help`, which lists `--base <ref>  diff against a base ref instead
  of local staged/unstaged changes`.
- [x] `--base <ref>` reads `git diff --unified=0 <ref>...HEAD` — implemented in
  `src/git/diff.ts`'s `getGitDiff(base?)`; verified in an isolated temp repo where a second
  commit's `any`/`console.log` changes were correctly detected via `--base <first-commit-sha>`.
- [x] Existing local behavior unchanged when `--base` is omitted — verified: clean tree still
  prints "No git diff found..." with exit 0; a staged diff (no `--base`) still reports the same
  findings/risk score as before this change.
- [x] `--format console/json/markdown` and `--json` unchanged and compose correctly with
  `--base` — verified all three formats against the same base-ref diff in the temp repo; output
  shape/content matched the equivalent non-base run.
- [x] `.github/workflows/slopcheck.yml` created — triggers on `pull_request`, uses
  `actions/checkout@v4` with `fetch-depth: 0`, `actions/setup-node@v4` (Node 20),
  `pnpm/action-setup@v4`, `pnpm install --frozen-lockfile`, `pnpm build`, then runs
  `pnpm tsx src/cli.ts diff --base "origin/${{ github.base_ref }}" --format markdown >>
  "$GITHUB_STEP_SUMMARY"`. The run step's exit code is the CLI's exit code (append redirection
  doesn't swallow it), so a risky PR fails the check. All actions used
  (`actions/checkout`, `actions/setup-node`, `pnpm/action-setup`) are free, widely-used,
  GitHub/pnpm-maintained actions on GitHub-hosted runners — no paid services.
- [x] README "GitHub Actions" section added — explains `--base`, links to the workflow file, and
  describes each step; also added a `--base` example to the install/run section and updated the
  MVP-status bullet list (GitHub Action example moved out of "not shipped yet"; roadmap's GitHub
  Action line removed since it now exists).
- [x] No unnecessary dependencies added — `package.json` dependencies/devDependencies unchanged;
  `getGitDiff` reuses the existing `execa` dependency.
- [x] `pnpm build` — exit 0.
- [x] `pnpm typecheck` — exit 0.
- [x] `pnpm test` — exit 0, **7 test files passed (7), 43 tests passed (43)** (40 pre-existing +
  3 new `getGitDiff` tests); all pre-existing 40 tests still pass unchanged.
- [x] Focused `getGitDiff` tests added at `tests/git/diff.test.ts`: clean tree with no base ref
  → empty diff; a real temp repo with two commits → `--base <first-commit>` detects the second
  commit's added line; `--base HEAD` (no diff against current HEAD) → empty diff. Uses a real
  temporary git repo (`mkdtempSync`/`execa`) rather than mocking `execa`, consistent with the
  project's existing preference for real git behavior over mocks.
- [x] `pnpm tsx src/cli.ts diff --help` documents `--base` — confirmed in output.
- [x] Manual verification in an isolated temp repo (`%TEMP%\slopcheck-011-test`, removed
  afterward):
  - Clean tree, no `--base` → "No git diff found...", exit 0.
  - Staged risky diff (`any` + `console.log`), no `--base` → 2 findings, `Risk score: 30/100
    (medium)`, exit 0 (medium risk, no high-severity finding, matching existing exit-code logic).
  - Committed that change, then `slopcheck diff --base <first-commit-sha>` → same 2 findings and
    risk score, confirming base-ref diffing picks up committed changes local diff can't see.
  - `--base <sha> --format json` → valid JSON with matching findings/risk/counts.
  - `--base <sha> --format markdown` → Markdown with matching heading/score/level/table/findings.

### Files changed

- `src/git/diff.ts` — `getGitDiff` now accepts an optional `base` parameter; when provided, runs
  `git diff --unified=0 <base>...HEAD` instead of the staged/unstaged lookup. Behavior when
  `base` is omitted is byte-for-byte unchanged from before.
- `src/cli.ts` — added `--base <ref>` option to the `diff` command; passes `options.base` through
  to `getGitDiff`.
- `tests/git/diff.test.ts` — new: 3 focused tests for `getGitDiff` using a real temporary git
  repo (clean tree, base-ref diff detection, no-diff-against-HEAD case).
- `.github/workflows/slopcheck.yml` — new: PR-triggered workflow running SlopCheck with
  `--base`/`--format markdown` and writing to `$GITHUB_STEP_SUMMARY`.
- `README.md` — added a "GitHub Actions" section; added a `--base` example to "Install and run";
  updated "Current status (MVP)" bullets and the "Roadmap" list to reflect that the GitHub
  Action example now exists.
- `.ai-os/tasks/active/011-add-github-action-example.md` — checked criteria, this completion
  report.
- `.ai-os/current-goal.md` — checked "GitHub Action example exists" and "011 — Add GitHub Action
  example".
- `.ai-os/architecture.md` — updated "Git diff reader" description to mention `--base` support
  and updated the "GitHub Action (later)" note to reflect the now-existing workflow.

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts diff --help
# isolated temp repo (%TEMP%\slopcheck-011-test):
#   git init + initial commit of a safe foo.ts
node <tsx cli> src/cli.ts diff                                    # clean tree, no --base
#   staged foo.ts rewritten with any + console.log
node <tsx cli> src/cli.ts diff                                    # staged diff, no --base
#   git commit
node <tsx cli> src/cli.ts diff --base <first-commit-sha>          # console format
node <tsx cli> src/cli.ts diff --base <first-commit-sha> --format json
node <tsx cli> src/cli.ts diff --base <first-commit-sha> --format markdown
# temp repo removed afterward
```

- `pnpm build`: exit 0.
- `pnpm typecheck`: exit 0.
- `pnpm test`: exit 0, "Test Files 7 passed (7)", "Tests 43 passed (43)".
- `pnpm tsx src/cli.ts diff --help`: exit 0, `--base <ref>` listed.
- Clean-tree `diff` (no `--base`): exit 0, "No git diff found...".
- Staged-diff `diff` (no `--base`): exit 0, 2 findings, `Risk score: 30/100 (medium)`.
- `diff --base <sha>` (console): exit 0, same 2 findings and risk score as the staged run.
- `diff --base <sha> --format json`: exit 0, valid JSON matching the console run's data.
- `diff --base <sha> --format markdown`: exit 0, Markdown matching the console run's data.

(As in task 009, invoking through `pnpm --dir <repo> exec tsx ...` from the temp repo resets the
child process's cwd; verification instead used `node <tsx>/dist/cli.mjs <path-to-src>/cli.ts
diff` directly from the temp repo's directory, which preserves the correct cwd.)

### Blockers (if any)

None. Task completed fully.

### `.ai-os` updates made

- `current-goal.md`: checked "GitHub Action example exists" under Definition of Done and
  "011 — Add GitHub Action example" under Progress.
- `architecture.md`: updated the "Git diff reader" bullet to describe `getGitDiff(base?)` and
  its base-ref mode, and updated the "GitHub Action (later)" section to state the example now
  exists at `.github/workflows/slopcheck.yml`.

### Suggested follow-ups

- Backlog item 12 (npm publishing prep) is next per `current-goal.md`'s Progress list.
- The workflow currently only writes to the job summary; posting the Markdown as an actual PR
  comment (roadmap item) would need a token with `pull-requests: write` permission and a
  comment-posting step — deliberately out of scope for this task.
