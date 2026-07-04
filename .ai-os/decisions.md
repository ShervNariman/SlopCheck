# Architectural Decision Log

Format: one entry per decision. Newest at the bottom. Agents should append new decisions here
when they make (or the Manager Agent approves) a real architectural choice — not for routine
implementation details.

---

## ADR-001: TypeScript + Node.js

**Decision:** SlopCheck is written in TypeScript, running on Node.js.

**Why:** TypeScript gives us type safety for the rule engine and reporters; Node.js gives the
broadest reach for a CLI that developers can install via npm and run in CI (GitHub Actions,
etc.) without extra runtime setup.

---

## ADR-002: pnpm as the package manager

**Decision:** Use pnpm (not npm or yarn) for dependency management and scripts.

**Why:** Fast, disk-efficient, strict dependency resolution (catches phantom dependencies),
and already the configured package manager (`devEngines.packageManager` in `package.json`).

---

## ADR-003: Commander for CLI parsing

**Decision:** Use the `commander` package for command/flag parsing.

**Why:** Already a dependency, well-established, minimal, and sufficient for the MVP's small
command surface (`diff`, and future format flags). No need for a heavier CLI framework.

---

## ADR-004: Vitest for tests

**Decision:** Use `vitest` as the test runner.

**Why:** Already a dev dependency, fast, native ESM/TypeScript support with no extra config,
Jest-compatible API so it's familiar to contributors.

---

## ADR-005: tsup for build

**Decision:** Use `tsup` to bundle `src/` into `dist/` for publishing.

**Why:** Already a dev dependency, zero-config-friendly esbuild-based bundler well suited to
small CLI packages, produces both the JS output and type declarations with minimal setup.

---

## ADR-006: Local-first MVP

**Decision:** The MVP runs entirely on the developer's machine. No network calls except to
git itself (local repo operations).

**Why:** Matches the mission — SlopCheck should work offline, respect developer privacy (code
never leaves the machine), and have zero setup friction.

---

## ADR-007: No backend or SaaS for the MVP

**Decision:** No hosted backend, no accounts/auth, no hosted dashboard for the MVP.

**Why:** The MVP's value is "catch risky patches locally, fast." A backend adds infrastructure
cost, auth complexity, and privacy concerns that aren't justified until there's a clear,
validated need (e.g. team-wide dashboards) — which is explicitly out of scope until requested.

---

## ADR-008: Deterministic rules before LLM-based analysis

**Decision:** All MVP rules are deterministic (regex/string/pattern based). No LLM calls in the
core rule engine for the MVP.

**Why:** Deterministic rules are fast, free, offline-friendly, explainable, and testable with
plain unit tests. LLM-based analysis is expensive, non-deterministic, and adds a paid-service
dependency — none of which fit "free-first, local-first." If LLM-based analysis is ever added,
it will be an optional additive layer on top of a working deterministic core, not a replacement.

---

## ADR-009: SlopCheck is not an AI detector

**Decision:** SlopCheck never attempts to classify whether code was authored by a human or an
AI. It only evaluates the risk characteristics of a diff.

**Why:** AI-authorship detection is unreliable, controversial, and beside the point. The real
goal is catching risky patterns regardless of origin — trying to detect "AI-ness" would be a
distraction from that goal and could mislead users into false confidence about human-written
code that has the same risky patterns.
