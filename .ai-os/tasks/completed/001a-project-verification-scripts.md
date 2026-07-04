# Task 001a: Add project verification scripts

## Goal

Add basic project verification scripts (`build`, `typecheck`, `test`, `dev`) so future AI-OS
tasks can reliably run build, typecheck, and test commands, and fix the underlying `tsconfig.json`
gap that causes Node globals (like `process`) to fail typechecking.

## Context

Task 001 (clean CLI structure) completed successfully, but its completion report flagged two
pre-existing project setup gaps discovered during verification (not regressions from that task):

- `pnpm build` fails because no `build` script exists in `package.json` yet.
- `pnpm exec tsc --noEmit` fails with `Cannot find name 'process'` because `tsconfig.json` does
  not resolve Node type definitions correctly for this project's package-manager/module setup.

This task is a small, standalone infra fix so every subsequent implementation/QA task can
actually run `pnpm build`, `pnpm typecheck`, and `pnpm test` as part of verification, per
`.ai-os/operating-rules.md` rule 7 ("Run tests/build before marking complete").

This is not one of the 12 numbered MVP backlog items in `.ai-os/backlog.md` — it's a
prerequisite/tooling task that unblocks reliable verification for those items (especially item 9
"Add tests" and item 12 "Prepare npm publishing"), and directly contributes to two Definition of
Done items in `.ai-os/current-goal.md`: "`pnpm test` passes" and "`pnpm build` passes".

## Acceptance Criteria

- [ ] `package.json` has these scripts:
  - `"build": "tsup"`
  - `"typecheck": "tsc --noEmit"`
  - `"test": "vitest run"`
  - `"dev": "tsx src/cli.ts"`
- [ ] `tsconfig.json` is updated so Node globals like `process` typecheck correctly.
- [ ] `pnpm build` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes or exits cleanly with no tests found if no tests exist yet.
- [ ] `pnpm tsx src/cli.ts --help` still works.
- [ ] `pnpm tsx src/cli.ts diff` still works.
- [ ] No unnecessary dependencies are added.

## Done Means

This task is done only when every criterion above has been verified by actually running the
commands, and a completion report has been appended below.

## Files likely affected

- `package.json` (scripts only)
- `tsconfig.json` (Node types fix)

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts --help`
- `pnpm tsx src/cli.ts diff`

## Non-goals

- Do not implement the rule engine yet (backlog item 2).
- Do not add new SlopCheck product features.
- Do not add tests yet unless required to make Vitest run cleanly with zero tests.
- Do not add or upgrade dependencies.

## Suggested agent

Implementation Agent

---

## Completion Report

**Status:** Complete

**Agent:** Implementation

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `package.json` has `build`/`typecheck`/`test`/`dev` scripts — verified by reading
      `package.json`: `"build": "tsup"`, `"typecheck": "tsc --noEmit"`,
      `"test": "vitest run --passWithNoTests"`, `"dev": "tsx src/cli.ts"`. (`test` needed the
      `--passWithNoTests` flag beyond the literal script text requested — see note below —
      to actually satisfy "passes or exits cleanly with no tests found".)
- [x] `tsconfig.json` updated so Node globals typecheck correctly — added
      `"types": ["node"]` (the installed `@types/node` package was present in `node_modules`
      but not being auto-included by `tsc`, so an explicit `types` array was needed) and
      `"ignoreDeprecations": "6.0"` (needed separately to unblock `tsup`'s `.d.ts` build step —
      see Blockers/notes below). Verified via `pnpm typecheck` exiting 0 with no errors.
- [x] `pnpm build` passes — verified: `tsup` builds `dist/cli.js` (ESM) and `dist/cli.d.ts`
      successfully, exit code 0. Also verified the built output actually runs:
      `node dist/cli.js --help` prints the expected usage text.
- [x] `pnpm typecheck` passes — verified: `tsc --noEmit` exits 0 with no output.
- [x] `pnpm test` passes / exits cleanly with no tests — verified: `vitest run
      --passWithNoTests` prints "No test files found, exiting with code 0", exit code 0. No
      test files were added (none were required to achieve a clean exit).
- [x] `pnpm tsx src/cli.ts --help` still works — verified, prints expected usage/commands.
- [x] `pnpm tsx src/cli.ts diff` still works — verified in two scenarios: (1) on a clean tree,
      prints "No git diff found. Make a code change first, then run SlopCheck.", exit 0;
      (2) with a temporary, reverted risky-pattern edit to `src/example.ts`, correctly reports
      all 4 findings (`any`, `TODO`/`FIXME`/`HACK`, `console.log`, broad `catch`), exit 0 — same
      behavior as verified in task 001, confirming this task didn't regress detection.
- [x] No unnecessary dependencies are added — verified `git diff --stat` against
      `package.json`/`pnpm-lock.yaml`: only the `scripts` block in `package.json` changed
      (4 insertions, 1 deletion), `pnpm-lock.yaml` is untouched. `pnpm install` was run once to
      correctly materialize `@types/node` in `node_modules` (it was already declared in
      `package.json`/`pnpm-lock.yaml` from before this task — nothing new was added to either
      file).

### Files changed

- `package.json` — added `build`, `typecheck`, `test` (with `--passWithNoTests`), and `dev`
  scripts. No dependency changes.
- `tsconfig.json` — added `"types": ["node"]` (fixes `process` and other Node globals not
  typechecking) and `"ignoreDeprecations": "6.0"` (fixes an unrelated `tsup`/TypeScript 6.0.3
  incompatibility encountered while verifying `pnpm build`, see notes below).
- `.ai-os/tasks/active/001a-project-verification-scripts.md` (this file) — new task file
  documenting this prerequisite/tooling task (not one of the 12 numbered MVP backlog items).
- `.ai-os/current-goal.md` — see ".ai-os updates made" below.

`tsup.config.ts` was briefly (mistakenly) overwritten during this task without reading it
first — it already existed and was tracked. It was reverted to its original committed content
before finishing; the final state of this task makes **no changes** to `tsup.config.ts`.
`src/example.ts` was only temporarily edited (twice) to verify detection behavior and was
reverted via `git checkout` both times; it is unchanged from `HEAD`.

### Commands run to verify

```
pnpm install                      # materialize already-declared @types/node
pnpm exec tsc --noEmit            # confirmed pre-existing process error, before fix
pnpm build                        # confirmed pre-existing missing-script failure, before fix
pnpm build                        # after adding scripts + types fix -> passed
node dist/cli.js --help           # confirmed built output runs
pnpm typecheck                    # passed, exit 0
pnpm test                         # initially exit 1 (no test files); fixed with
                                   # --passWithNoTests -> exit 0
pnpm tsx src/cli.ts --help        # passed
pnpm tsx src/cli.ts diff          # passed (clean-tree case: "No git diff found...")
pnpm dev --help                   # passed (same output as tsx src/cli.ts --help)
(temporarily edited src/example.ts with an equivalent risky function, twice, each time
 reverted with `git checkout -- src/example.ts`)
pnpm tsx src/cli.ts diff          # passed (risky-diff case: all 4 findings reported)
git diff --stat -- package.json pnpm-lock.yaml tsup.config.ts   # confirmed no dependency
                                                                  # or tsup config changes
```

All commands above passed with the results described in "Acceptance criteria results".

### Blockers (if any)

None blocking — all acceptance criteria were met. Two notes worth recording since they required
small deviations from the literal task brief:

1. **`test` script needed `--passWithNoTests`.** A plain `"test": "vitest run"` exits with code
   1 when no test files exist ("No test files found, exiting with code 1"), which does not
   satisfy "passes or exits cleanly with no tests found." Adding the `--passWithNoTests` flag
   (Vitest's built-in support for this exact scenario) makes it exit 0 instead, without adding
   any placeholder test files (per this task's non-goals).
2. **`pnpm build` needed an additional `tsconfig.json` fix beyond the Node-types fix.** With
   only `"types": ["node"]` added, `pnpm build` still failed during `tsup`'s `.d.ts` generation
   step with `error TS5101: Option 'baseUrl' is deprecated...`, even though this project's own
   `tsconfig.json` does not set `baseUrl` anywhere. This is an incompatibility between `tsup`
   8.5.1's internal `.d.ts` bundler and the installed TypeScript 6.0.3 (a very new/pre-release
   TypeScript version). Adding `"ignoreDeprecations": "6.0"` (as suggested by the error message
   itself) resolved it without disabling `.d.ts` generation or downgrading any dependency.

### `.ai-os` updates made

- `current-goal.md` — checked off "`pnpm test` passes" and "`pnpm build` passes" in the
  Definition of Done, since both are now genuinely true at the repo's current state. Added a
  note to the Progress section referencing this prerequisite task (it isn't one of the 12
  numbered backlog items, so it's recorded separately rather than renumbering the list).
- `architecture.md` / `decisions.md` — no changes. No new architectural decisions were made;
  this was a build-tooling/config fix, not a structural or product decision.
- `backlog.md` — no changes. This task was a prerequisite/tooling fix flagged by task 001's
  completion report, not one of the 12 numbered MVP backlog items.

### Suggested follow-ups

- Backlog item 2 ("Add rule engine") remains the next product-focused task and is unaffected by
  this change.
- Backlog item 9 ("Add tests") can now rely on `pnpm test` working correctly and failing loudly
  once real test files are added (the `--passWithNoTests` flag only affects the zero-test case).
- Worth a quick look during backlog item 12 (npm publishing prep): confirm the TypeScript
  6.0.3 / `tsup` `.d.ts` interaction doesn't cause other surprises as the codebase grows (e.g.
  if `baseUrl` or path aliases are ever intentionally added later, `ignoreDeprecations` may mask
  a real deprecation warning worth revisiting at that time).
