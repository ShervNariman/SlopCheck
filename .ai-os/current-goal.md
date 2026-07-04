# Current Goal

> This file always describes exactly one active goal. When the goal below is complete, the
> Manager Agent replaces this file's contents with the next goal (see `backlog.md` for what
> comes after the MVP).

## Goal

Complete the SlopCheck MVP as a polished local CLI.

## Definition of Done

- [x] CLI has clean structure (entrypoint separated from diff-reading, scanning, and models)
- [ ] Rule engine exists (rules are pluggable units, not inline `if` statements in the CLI)
- [ ] Findings model exists (a shared `Finding` type/module used across rules and reporters)
- [ ] Risk scoring exists (patch-level or run-level score derived from findings)
- [ ] Console reporter exists (human-readable terminal output)
- [ ] JSON reporter exists (machine-readable output for tooling/CI)
- [ ] Markdown reporter exists (suitable for pasting into a PR comment)
- [ ] Tests exist for core rules (`any`, `@ts-ignore`, `TODO`/`FIXME`/`HACK`, `console.log`,
      broad `catch`)
- [ ] README explains install and usage
- [ ] GitHub Action example exists
- [ ] npm publishing prep is complete (package metadata, `bin` entry, build output verified)
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes

## Progress

- [x] 001 — Clean CLI structure
- [ ] 002 — Add rule engine
- [ ] 003 — Add findings model
- [ ] 004 — Add core rules
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
