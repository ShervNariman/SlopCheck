# Current Goal

> This file always describes exactly one active goal. When the goal below is complete, the
> Manager Agent replaces this file's contents with the next goal (see `backlog.md` for what
> comes after the MVP).

## Goal

Complete the SlopCheck MVP as a polished local CLI.

## Definition of Done

- [x] CLI has clean structure (entrypoint separated from diff-reading, scanning, and models)
- [x] Rule engine exists (rules are pluggable units, not inline `if` statements in the CLI)
- [x] Findings model exists (a shared `Finding` type/module used across rules and reporters)
- [ ] Risk scoring exists (patch-level or run-level score derived from findings)
- [ ] Console reporter exists (human-readable terminal output)
- [ ] JSON reporter exists (machine-readable output for tooling/CI)
- [ ] Markdown reporter exists (suitable for pasting into a PR comment)
- [ ] Tests exist for core rules (`any`, `@ts-ignore`, `TODO`/`FIXME`/`HACK`, `console.log`,
      broad `catch`)
- [ ] README explains install and usage
- [ ] GitHub Action example exists
- [ ] npm publishing prep is complete (package metadata, `bin` entry, build output verified)
- [x] `pnpm test` passes
- [x] `pnpm build` passes

## Progress

- [x] 001 — Clean CLI structure
- [x] 001a — Add project verification scripts (prerequisite/tooling task, not one of the 12
      numbered backlog items — fixed `pnpm build`/`pnpm typecheck`/`pnpm test` so future tasks
      can verify reliably)
- [x] 002 — Add rule engine
- [x] 003 — Add findings model
- [x] 004 — Add core rules (satisfied by Task 002; closed retrospectively by QA review)
- [ ] 005 — Add risk scoring
- [ ] 006 — Add console reporter
- [ ] 007 — Add JSON reporter
- [ ] 008 — Add Markdown reporter
- [ ] 009 — Add tests
- [ ] 010 — Add README
- [ ] 011 — Add GitHub Action example
- [ ] 012 — Prepare npm publishing

> Update the checkboxes above as tasks complete. This section should always reflect
> `backlog.md` and the state of `tasks/completed/`.

## Out of scope for this goal

- No SaaS, backend, auth, or hosted dashboard.
- No LLM-based analysis.
- No config file loader beyond what's needed to ship the MVP (can be a fast-follow goal).
