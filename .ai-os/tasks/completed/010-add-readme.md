# Task 010: Add README

## Goal

Create a strong, honest public `README.md` at the repo root so developers can understand what
SlopCheck is, install and run it locally, and see real example output — without overstating the
current MVP or documenting features that don't exist yet.

## Context

Tasks 001–009 are complete: the CLI has a clean modular structure, five core rules, structured
findings, risk scoring, three reporters (console, JSON, Markdown), and a 40-test Vitest suite.
There is no root `README.md` yet — only `.ai-os/README.md` (internal AI-OS docs).

Per `.ai-os/backlog.md` item 10 and `.ai-os/mission.md`, the README is the primary public
surface for explaining SlopCheck's positioning: a local, deterministic patch risk scanner — **not**
an AI detector, **not** a generic linter. The Release Agent should ground all claims in
`mission.md` and `decisions.md` (especially ADR-006 local-first, ADR-008 deterministic rules,
ADR-009 not an AI detector).

**Current CLI surface (from `src/cli.ts`):**
- Command: `slopcheck diff`
- Flags: `--format <format>` (`console` default, `json`, `markdown`), `--json` alias
- Version: `0.1.0` (Commander)
- Exit code 1 when a high-severity finding exists OR `risk.level === "high"`
- "No git diff found..." message when there's nothing to scan

**Current rules and severities:**
| Rule ID | Pattern | Severity |
|---------|---------|----------|
| `any-type` | TypeScript `any` | medium |
| `ts-ignore` | `@ts-ignore` | high |
| `todo-fixme-hack` | `TODO`/`FIXME`/`HACK` | low |
| `console-log` | `console.log` | low |
| `broad-catch` | broad `catch` block | medium |

**Risk scoring (from `src/scoring/risk-score.ts`):**
- Weights: high +40, medium +20, low +10, capped at 100
- Levels: 0–24 low, 25–59 medium, 60–100 high
- Zero findings → score 0, level low

**Package state (`package.json`):** Not yet npm-publishable — no `bin` entry, empty
`description`, no `repository`. README should document local dev usage (`pnpm install`,
`pnpm build`, `pnpm tsx src/cli.ts diff`) honestly, not claim `npm install -g slopcheck` works
yet (that's backlog item 12).

## Acceptance Criteria

- [x] `README.md` exists at the repo root.
- [x] README explains what SlopCheck is in one clear sentence.
- [x] README makes clear SlopCheck is **not** an AI detector and **not** a generic linter.
- [x] README explains the core value: catching risky AI-generated or hard-to-review patches
      before they land.
- [x] README includes installation/run examples that actually work:
      - `pnpm install`
      - `pnpm build`
      - `pnpm tsx src/cli.ts diff`
      - `pnpm tsx src/cli.ts diff --format json`
      - `pnpm tsx src/cli.ts diff --format markdown`
- [x] README includes example console output (representative of real CLI output).
- [x] README includes JSON and Markdown output examples (representative of real CLI output).
- [x] README lists the five current rules: `any`, `@ts-ignore`, `TODO`/`FIXME`/`HACK`,
      `console.log`, broad catch block (with severities).
- [x] README explains risk scoring simply (weights, cap, level bands).
- [x] README explains current MVP status honestly (what works now, what's not shipped yet).
- [x] README includes a roadmap section covering: GitHub Action, npm package, more rules,
      config file, PR comment support.
- [x] README is concise, developer-friendly, and suitable for a public GitHub repo — no
      over-marketing, no invented features.
- [x] No `src/` source code behavior changes.
- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes.

## Done Means

This task is done only when `README.md` exists at the repo root, every acceptance criterion is
verified (commands in the README actually run as documented; build/typecheck/test pass), and a
completion report is appended below.

## Files likely affected

- New: `README.md` (repo root)
- `.ai-os/current-goal.md` (check off README item in Definition of Done and Progress, once
  complete)

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts --help` (confirm documented commands/flags exist)
- Spot-check that each command shown in the README actually works (at minimum: `--help` and the
  documented `diff` invocation against a repo with a staged diff, or confirm output examples
  match verified output from task 009)

## Non-goals

- Do not add a GitHub Action example (backlog item 11).
- Do not prepare npm publishing — no `bin` entry, no `npm publish` docs (backlog item 12).
- Do not add new product features or change `src/` behavior.
- Do not over-market SlopCheck or claim AI-authorship detection.
- Do not add a `CHANGELOG.md` (Release Agent responsibility, but only after MVP ships).

## Suggested agent

Release Agent

---

## Completion Report

**Status:** Complete

**Agent:** Release

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `README.md` exists at repo root — created `README.md`.
- [x] One-sentence description — opening bold sentence: "SlopCheck scans your git diff for risky
  patterns in added lines and gives you a short, actionable report before you merge."
- [x] Not an AI detector / not a generic linter — dedicated "What SlopCheck is not" section
  with both points, grounded in `mission.md` and ADR-009.
- [x] Core value explained — "Why use it" section covers catching risky/hard-to-review patches
  before they land.
- [x] Installation/run examples — documents `pnpm install`, `pnpm build`, and all three `diff`
  invocations (`console`, `--format json`, `--format markdown`). Commands match `src/cli.ts`
  flags; verified via `pnpm tsx src/cli.ts --help`.
- [x] Example console output — matches verified output from task 009 (6 findings, risk 100/100
  high).
- [x] JSON and Markdown examples — representative excerpts from verified task 009 CLI runs;
  JSON example notes truncation for readability.
- [x] Five rules listed with severities — table in "Rules" section.
- [x] Risk scoring explained — weights (+40/+20/+10), cap at 100, level bands, exit-code
  behavior.
- [x] MVP status — "Current status (MVP)" section lists what works and what's not shipped.
- [x] Roadmap — GitHub Action, npm package, more rules, config file, PR comment support.
- [x] Concise and honest — no invented features, no `npm install -g slopcheck` claim (not
  shipped yet per backlog 012).
- [x] No `src/` changes — only `README.md` added.
- [x] `pnpm build` — exit 0.
- [x] `pnpm typecheck` — exit 0.
- [x] `pnpm test` — exit 0, 6 files / 40 tests passed.

### Files changed

- `README.md` — new public README: positioning, MVP status, install/run, example output,
  rules, risk scoring, roadmap, development commands.
- `.ai-os/tasks/active/010-add-readme.md` — checked criteria, this completion report.
- `.ai-os/current-goal.md` — checked "README explains install and usage" and "010 — Add README".

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts --help
```

- `pnpm build`: exit 0, `dist/cli.js` built.
- `pnpm typecheck`: exit 0.
- `pnpm test`: exit 0, "Test Files 6 passed (6)", "Tests 40 passed (40)".
- `pnpm tsx src/cli.ts --help`: exit 0, confirms `diff` command and `--format`/`--json` flags
  documented in README exist.

### Blockers (if any)

None.

### `.ai-os` updates made

- `current-goal.md`: checked "README explains install and usage" in Definition of Done and
  "010 — Add README" in Progress.

### Suggested follow-ups

- Backlog item 11 (GitHub Action example) is next per `current-goal.md` Progress.
- Replace `<repo-url>` placeholder in README once a public repository URL is known.
