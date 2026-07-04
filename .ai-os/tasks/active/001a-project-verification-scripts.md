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

<To be appended by the Implementation Agent once work is done or blocked, using
`.ai-os/templates/completion-report.md`.>
