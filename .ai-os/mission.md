# SlopCheck Mission

## Long-term mission

SlopCheck catches risky AI-generated (or otherwise hard-to-review) code patches **before they
land**, so that developers and reviewers can move fast with AI-assisted coding without quietly
accumulating risk.

Concretely, SlopCheck exists to:

- **Catch risky patches, not risky code in general.** SlopCheck looks at diffs — what changed —
  not entire codebases. The unit of analysis is the patch a human is about to review or merge.
- **Help reviewers spend attention where it matters.** A human reviewer has limited attention.
  SlopCheck's job is to point that attention at the lines most likely to hide a real problem:
  silently swallowed errors, loosened types, leftover debug output, unfinished work, and similar
  patterns that are easy to miss in a fast AI-assisted review.
- **Fit into how developers already work.** Local-first CLI, git-diff-based, usable in a
  terminal or a CI step (e.g. a GitHub Action), with zero required setup beyond installing the
  package.

## What SlopCheck is

- A **local, deterministic, rule-based patch risk scanner**.
- A tool that produces a small number of **actionable findings with severities**, not walls of
  noise.
- A tool that plays well with existing review workflows (terminal output, JSON for tooling,
  Markdown for PR comments).

## What SlopCheck is not (non-goals)

- **Not a generic linter.** ESLint, TypeScript, and friends already do general code-quality
  linting well. SlopCheck should not duplicate that surface area. It focuses specifically on
  patterns correlated with risky or low-effort AI-generated changes and reviewer blind spots.
- **Not an "AI detector."** SlopCheck does not try to determine whether code was written by an
  AI. It does not classify authorship. It flags risky patterns in a diff regardless of who or
  what wrote it.
- **Not a SaaS product (for the MVP).** No backend, no accounts, no hosted dashboard, no data
  leaving the developer's machine. Local-first and free-first.
- **Not trying to be exhaustive.** A small set of high-signal, deterministic rules beats a huge
  set of noisy heuristics. Precision over recall, especially early on.
- **Not an LLM wrapper.** The MVP is deterministic pattern/heuristic based. LLM-based analysis,
  if ever added, comes later and only as an addition on top of a working deterministic core —
  never as a replacement for it.

## What "good" looks like

A developer runs `slopcheck diff` (or wires it into CI) after an AI pairing session and, in a
few seconds, gets a short, honest list of the specific lines in the patch that deserve a second
look before merging — with enough context to act on it immediately.
