# Architecture

This describes the **intended** lightweight architecture for the SlopCheck MVP. It is a target
to converge on incrementally via the backlog, not something to build all at once. Keep it
simple — this is a CLI that reads a diff, runs some rules, and prints findings. Resist the urge
to add layers, plugins systems, or abstractions the MVP doesn't need yet.

## Current state (as of this writing)

Tasks 001 (clean CLI structure), 001a (verification scripts), and 002 (rule engine) are
complete. `src/cli.ts` is the CLI entrypoint only (Commander wiring, the `diff` command's
orchestration, and console printing). Git diff reading lives in `src/git/diff.ts`. Rule
execution now matches the target layout below: `src/rules/types.ts` defines the `Rule`
interface, `src/rules/index.ts` is the rule registry, and one file per rule
(`any-type.ts`, `ts-ignore.ts`, `todo-fixme.ts`, `console-log.ts`, `broad-catch.ts`) implements
each check. `src/engine/scan.ts` extracts added diff lines and runs every registered rule
against them, returning `Finding[]`. The old interim `src/scan/scanDiff.ts` module (and the
`src/scan/` folder) has been removed — `cli.ts` calls the engine's `scan()` function directly.
Task 003 (findings model) is also complete: `src/findings/types.ts` now matches the target
`Finding` shape below exactly (`ruleId`, `severity`, `message`, optional `line`), and
`src/engine/scan.ts` sets `ruleId` (from the originating rule's `id`) and `line` (the cleaned
added-line text) on every finding it produces. `src/cli.ts`'s `printFindings` was not changed —
it only ever read `severity`/`message`, so console output is unaffected by the richer shape.
`src/example.ts` is a sample file with intentionally risky patterns used for manual testing and
is unchanged.

This structure still does not fully match the full target layout below — there is no risk
scorer yet, and only one reporter (console, still inline in `cli.ts`). Those come from backlog
items 5–8.

## Target module layout

```
src/
  cli.ts              CLI entrypoint only: argument parsing, command wiring, exit codes
  git/
    diff.ts            Reads the current git diff (staged, falling back to unstaged)
  rules/
    types.ts           Rule interface
    index.ts           Rule registry (list of all rules the engine runs)
    any-type.ts         one rule per file, e.g. detects added `any`
    ts-ignore.ts
    todo-fixme.ts
    console-log.ts
    broad-catch.ts
  engine/
    scan.ts             Runs the rule engine over a diff, produces Finding[]
  findings/
    types.ts             Finding model (severity, message, rule id, file/line if available)
  scoring/
    risk-score.ts        Turns Finding[] into a risk score / summary
  reporters/
    console.ts            Human-readable terminal output
    json.ts                Machine-readable JSON output
    markdown.ts            PR-comment-friendly Markdown output
  config/                 (later) loads optional user config (e.g. rule allow/deny list)
```

## Component responsibilities

### CLI entrypoint (`src/cli.ts`)

- Defines commands (`diff`, and later maybe `scan <path>` or similar) using Commander.
- Parses flags (e.g. `--json`, `--markdown`, `--format`).
- Delegates to the git diff reader, engine, and reporters. Contains no rule logic, no diff
  parsing logic, and no reporter formatting logic itself.
- Sets `process.exitCode` based on the risk result (e.g. non-zero when a high-severity finding
  exists), so it's usable as a CI gate.

### Git diff reader (`src/git/diff.ts`)

- Wraps `execa` calls to `git diff --cached` (falling back to unstaged `git diff`).
- Returns the raw diff text. No parsing of rule patterns here.

### Rule engine (`src/engine/scan.ts` + `src/rules/`)

- The rule engine takes diff text (or pre-parsed added lines) and runs every registered rule
  against it, collecting `Finding[]`.
- **Rule interface** (`src/rules/types.ts`): each rule is a small, pure, focused unit, roughly:

  ```ts
  export interface Rule {
    id: string;
    description: string;
    severity: "high" | "medium" | "low";
    check(line: string): boolean; // or richer context if/when needed
  }
  ```

- Rules are registered in `src/rules/index.ts` as a plain array. Adding a rule means adding one
  file + one line in the registry — no dynamic plugin loading for the MVP.
- Keep rule logic deterministic (regex/string checks). No LLM calls in the MVP rule engine.

### Finding model (`src/findings/types.ts`)

- A single shared `Finding` type used by every rule and every reporter, e.g.:

  ```ts
  export interface Finding {
    ruleId: string;
    severity: "high" | "medium" | "low";
    message: string;
    line?: string;
  }
  ```

- Reporters and the risk scorer should only ever depend on this shape, not on rule internals.

### Risk scorer (`src/scoring/risk-score.ts`)

- Takes `Finding[]` and produces a simple, explainable score/summary (e.g. counts by severity
  plus an overall verdict like `pass` / `warn` / `block`). Keep the formula simple and
  documented — no hidden weights that are hard to explain to a user.

### Reporters (`src/reporters/`)

- `console.ts` — today's human-readable terminal output (severity-tagged lines + summary).
- `json.ts` — structured `{ findings, score }` output for CI/tooling to consume.
- `markdown.ts` — a Markdown block suitable for pasting into or auto-posting to a PR comment.
- Reporters are pure functions: `(findings: Finding[], score: RiskScore) => string`. They do not
  read files, call git, or contain rule logic.

### Config loader (later)

- Not part of the current goal. When needed, a `slopcheck.config.json` (or similar) loader will
  live in `src/config/` and let users enable/disable rules or set severity overrides. Do not
  build this until a backlog item explicitly calls for it.

### GitHub Action (later)

- Not part of the CLI's own source. Lives as a documented example (e.g. a workflow YAML snippet
  in the README or `.github/workflows/example.yml`) that runs `npx slopcheck diff` (or similar)
  on pull requests using the JSON or Markdown reporter. See backlog item 11.

## Design principles for this architecture

- One responsibility per file/module. If a file is doing two of {read git, run rules, print
  output}, it should be split.
- No dependency injection frameworks, no plugin loaders, no abstract base classes for a handful
  of rules. Plain functions and small interfaces.
- Reporters and rules must not import from `cli.ts`. Dependencies flow one way: `cli.ts` → 
  engine/reporters → rules/findings.
- Anything not explicitly required by the current goal (config files, LLM integration, backend,
  dashboard) stays out of this architecture until a backlog item asks for it.
