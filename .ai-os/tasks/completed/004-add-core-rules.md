# Task 004: Add core rules

## Goal

Formalize the current inline checks as discrete rule modules under `src/rules/`: added `any`,
`@ts-ignore`, `TODO`/`FIXME`/`HACK`, `console.log`, broad `catch`.

## Context

This task was reviewed retrospectively by the Manager Agent and QA Agent on 2026-07-04 after
Tasks 002 (rule engine) and 003 (findings model) completed. The review determined that backlog
item 4's acceptance criteria were already fully satisfied by Task 002's implementation — Task
002 did not merely scaffold the rule engine; it moved all five existing inline checks into
individual rule modules with correct severities and registry entries as part of replacing
`src/scan/scanDiff.ts`.

Task 003 threaded `ruleId`/`line` through findings but did not change rule definitions or
behavior. No additional implementation work was required for item 4.

## Acceptance Criteria (from backlog item 4)

- [x] One rule module per pattern, each exporting a `Rule` matching the interface from item 2.
- [x] Registered in the rule registry.
- [x] Each rule's severity matches current behavior (`any`→medium, `@ts-ignore`→high,
      `TODO/FIXME/HACK`→low, broad catch→medium, `console.log`→low).
- [x] Running against `src/example.ts`'s diff surfaces all findings present in that file
      (four findings: `any`, `TODO`, `console.log`, broad `catch` — `src/example.ts` does not
      contain `@ts-ignore`; the fifth rule is verified separately).

## Done Means

This task is done because every backlog item 4 acceptance criterion was verified by code
inspection and command runs. No new product code was written — closure is documented here as a
retrospective QA confirmation that Task 002 already delivered item 4.

## Suggested agent

Implementation Agent (work already done in Task 002; this file closed by Manager + QA review)

---

## Completion Report

**Status:** Complete (retrospective closure — satisfied by Task 002)

**Agent:** Manager + QA

**Date:** 2026-07-04

### Review conclusion

Backlog item 4 ("Add core rules") is **already satisfied** by the work completed in Task 002
("Add rule engine"). Task 002's acceptance criteria explicitly required creating five individual
rule modules covering exactly the core patterns listed in backlog item 4, registering them in
`src/rules/index.ts`, and preserving identical detection behavior and severities. Task 003 only
enriched the `Finding` model with `ruleId`/`line`; it did not add, remove, or alter any rules.

No new product features were added during this review. No rule behavior was changed.

### Acceptance criteria results

- [x] One rule module per pattern, each exporting a `Rule` matching the interface from item 2
      — verified by reading `src/rules/`:
      - `any-type.ts` → `anyTypeRule` (`id: "any-type"`)
      - `ts-ignore.ts` → `tsIgnoreRule` (`id: "ts-ignore"`)
      - `todo-fixme.ts` → `todoFixmeHackRule` (`id: "todo-fixme-hack"`)
      - `console-log.ts` → `consoleLogRule` (`id: "console-log"`)
      - `broad-catch.ts` → `broadCatchRule` (`id: "broad-catch"`)
      Each exports a `Rule` object conforming to `src/rules/types.ts`
      (`id`, `description`, `severity`, `check(line): boolean`).
- [x] Registered in the rule registry — verified in `src/rules/index.ts`: all five rules are
      imported and listed in the `rules: Rule[]` array in this order:
      `anyTypeRule`, `tsIgnoreRule`, `todoFixmeHackRule`, `consoleLogRule`, `broadCatchRule`.
- [x] Severities match current/previous behavior and backlog item 4's explicit mapping —
      verified by reading each rule module:
      | Pattern | Rule file | Severity | Expected |
      |---------|-----------|----------|----------|
      | TypeScript `any` | `any-type.ts` | `medium` | `medium` ✓ |
      | `@ts-ignore` | `ts-ignore.ts` | `high` | `high` ✓ |
      | `TODO`/`FIXME`/`HACK` | `todo-fixme.ts` | `low` | `low` ✓ |
      | `console.log` | `console-log.ts` | `low` | `low` ✓ |
      | broad `catch` | `broad-catch.ts` | `medium` | `medium` ✓ |
      No severity changes were made; `decisions.md` was not updated (no decision change).
- [x] `src/example.ts` diff surfaces all findings present in that file — verified in an
      isolated temp git repo staging content identical to `src/example.ts`: 4 findings reported
      (`any`→medium, `TODO`→low, `console.log`→low, broad `catch`→medium), exit 0 (no
      high-severity finding). Note: `src/example.ts` intentionally omits `@ts-ignore`; backlog
      item 4's "all five findings" wording applies to the full rule set, not to `example.ts`
      alone. The `@ts-ignore` rule is verified in the all-five-patterns test below.
- [x] All five rule patterns fire correctly in a combined risky diff — verified in the same
      temp repo with a file containing `any`, `TODO`, `console.log`, broad `catch`, and
      `@ts-ignore`: 5 findings, correct severities, exit 1 (high-severity `@ts-ignore`).

### Rule inventory (confirmed)

| Backlog pattern | Module | Registry export | `id` | `severity` |
|-----------------|--------|-----------------|------|------------|
| TypeScript `any` | `src/rules/any-type.ts` | `anyTypeRule` | `any-type` | medium |
| `@ts-ignore` | `src/rules/ts-ignore.ts` | `tsIgnoreRule` | `ts-ignore` | high |
| `TODO`/`FIXME`/`HACK` | `src/rules/todo-fixme.ts` | `todoFixmeHackRule` | `todo-fixme-hack` | low |
| `console.log` | `src/rules/console-log.ts` | `consoleLogRule` | `console-log` | low |
| broad `catch` | `src/rules/broad-catch.ts` | `broadCatchRule` | `broad-catch` | medium |

`src/engine/scan.ts` iterates the registry and applies every rule to each added diff line.
Task 003 ensures each finding also carries `ruleId` (matching the rule's `id`) and `line`.

### Files changed

None (product code). This is a retrospective QA closure only.

AI-OS documentation updated by this review:
- `.ai-os/tasks/completed/004-add-core-rules.md` — this file (created).
- `.ai-os/current-goal.md` — checked off "004 — Add core rules" in Progress.
- `.ai-os/architecture.md` — "Current state" note added that item 4 is satisfied.

### Commands run to verify

```
pnpm build          → exit 0 (tsup builds dist/cli.js + dist/cli.d.ts)
pnpm typecheck      → exit 0 (tsc --noEmit, no errors)
pnpm test           → exit 0 (vitest run --passWithNoTests)
pnpm tsx src/cli.ts --help  → exit 0 (expected usage output)
```

End-to-end `slopcheck diff` verification (isolated temp git repo at
`$env:TEMP\slopcheck-qa-004`, invoking `C:\Projects\SlopCheck\src\cli.ts`):

```
# All five patterns
→ 5 findings:
   [MEDIUM] Added TypeScript "any": export function badExample(input: any) {
   [LOW] Added TODO/FIXME/HACK: // TODO: fix later
   [LOW] Added console.log: console.log(input);
   [MEDIUM] Added broad catch block: } catch (error) {
   [HIGH] Added @ts-ignore: // @ts-ignore
  exit 1

# src/example.ts content (4 patterns, no @ts-ignore)
→ 4 findings (same severities as above minus @ts-ignore)
  exit 0
```

Temp repo deleted after verification.

### Blockers (if any)

None.

### `.ai-os` updates made

- `current-goal.md` — checked off "004 — Add core rules" in the Progress checklist.
- `architecture.md` — "Current state" updated to note backlog item 4 is satisfied (rules were
  delivered as part of Task 002; this task is a retrospective closure).
- `decisions.md` — no changes (severities unchanged from original behavior).
- `backlog.md` — no changes.

### Suggested follow-ups

- **Next task: backlog item 5 — Add risk scoring** (`src/scoring/risk-score.ts`). The rule set
  and structured `Finding` model (`ruleId`, `severity`, `message`, `line`) are now in place;
  risk scoring can derive a patch-level verdict from `Finding[]` and replace the ad hoc
  "any high severity → exit 1" check in `src/cli.ts`.
- Backlog item 9 ("Add tests") remains open — core rules exist and are individually testable
  via each rule's pure `check(line)` function, but automated Vitest coverage has not been
  written yet.
