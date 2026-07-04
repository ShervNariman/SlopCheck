# Architecture

This describes the **intended** lightweight architecture for the SlopCheck MVP. It is a target
to converge on incrementally via the backlog, not something to build all at once. Keep it
simple — this is a CLI that reads a diff, runs some rules, and prints findings. Resist the urge
to add layers, plugins systems, or abstractions the MVP doesn't need yet.

## Current state (as of this writing)

Tasks 001 (clean CLI structure), 001a (verification scripts), 002 (rule engine), 003 (findings
model), 004 (core rules — satisfied by 002, closed retrospectively), 005 (risk scoring), 006
(console reporter), 007 (JSON reporter), and 008 (Markdown reporter) are complete. `src/cli.ts` is the CLI entrypoint only (Commander wiring, the
`diff` command's orchestration, exit-code setting, and the "no git diff" message). It no longer
contains finding or risk-score formatting logic. Git diff reading lives in `src/git/diff.ts`.
Rule execution matches the target layout below: `src/rules/types.ts` defines the `Rule`
interface, `src/rules/index.ts` is the rule registry, and one file per rule
(`any-type.ts`, `ts-ignore.ts`, `todo-fixme.ts`, `console-log.ts`, `broad-catch.ts`) implements
each check. `src/engine/scan.ts` extracts added diff lines and runs every registered rule
against them, returning `Finding[]`. `src/findings/types.ts` matches the target `Finding` shape
(`ruleId`, `severity`, `message`, optional `line`).

`src/scoring/risk-score.ts` provides `scoreRisk(findings: Finding[]): RiskResult` — a pure
function with no CLI/git dependency. `src/reporters/console.ts` provides
`reportConsole(findings: Finding[], risk: RiskResult): void` — also pure with respect to
git/rules/engine; it prints the findings list (or the "no obvious risky patterns" message) and the
`Risk score: N/100 (level) — summary` line. `src/reporters/json.ts` provides
`reportJson(findings: Finding[], risk: RiskResult): string`, returning a pretty-printed JSON
string containing `findings`, `risk`, and top-level `findingCount`/`highCount`/`mediumCount`/
`lowCount` — also pure, no git/rules/engine dependency, uses only built-in `JSON.stringify`.
`src/reporters/markdown.ts` provides `reportMarkdown(findings: Finding[], risk: RiskResult):
string`, returning a Markdown string with a SlopCheck heading, risk score/level, a finding-count
table, and per-finding bullets (severity, `ruleId`, message) — also pure, no git/rules/engine
dependency.

`src/cli.ts`'s `diff` command has a `--format <format>` option (`"console"` default, `"json"`,
or `"markdown"`) plus a `--json` boolean convenience alias. Its action calls
`getGitDiff → scan → scoreRisk`, then branches to `reportConsole`, `reportJson`, or
`reportMarkdown` based on the resolved format, then sets exit code 1 when either a high-severity
finding exists or `risk.level === "high"` — exit-code behavior is unconditional on format. The
pre-existing "No git diff found..." message is printed before format branching and is unaffected
by `--format`/`--json`.

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

- `scoreRisk(findings: Finding[]): RiskResult` — a pure function, no CLI/git dependency, fully
  unit-testable in isolation. Implemented (task 005) with an explicit, documented formula:
  per-severity weights `high = 40`, `medium = 20`, `low = 10`, summed and capped at 100, then
  mapped to `level` (`0–24` → `"low"`, `25–59` → `"medium"`, `60–100` → `"high"`). Zero findings
  is an explicit short-circuit case (`score: 0, level: "low", summary: "No risky patterns
  detected."`) rather than falling through the weighted-sum path.
- `RiskResult` shape: `{ score, level, summary, findingCount, highCount, mediumCount, lowCount
  }`. Keep the formula simple and documented in code — no hidden weights, no per-rule overrides,
  no config-driven tuning for the MVP.
- `src/cli.ts` calls this after `scan()` and prints one additional line
  (`Risk score: N/100 (level) — summary`); it does not replace or alter the existing per-finding
  console output. Exit code 1 is set when a high-severity finding exists OR `level` is `"high"`
  — both checks are kept because a single high-severity finding (score 40) alone falls in the
  `"medium"` band, so `level` alone isn't sufficient to preserve the original
  "any high severity finding → exit 1" guarantee.

### Reporters (`src/reporters/`)

- `console.ts` — implemented (task 006): `reportConsole(findings: Finding[], risk: RiskResult):
  void`. Prints the findings list (or the "no obvious risky patterns" message when `findings` is
  empty within a scanned diff) and the `Risk score: N/100 (level) — summary` line. Depends only
  on `Finding` and `RiskResult` types — no git, rules, or engine imports.
- `json.ts` — implemented (task 007): `reportJson(findings: Finding[], risk: RiskResult):
  string`. Returns a pretty-printed JSON string with `findings`, `risk`, and top-level
  `findingCount`/`highCount`/`mediumCount`/`lowCount`. Same purity constraints as `console.ts`
  — no git/rules/engine imports, no new dependency (built-in `JSON.stringify`). Selected via
  `slopcheck diff --format json` or the `--json` alias; stdout contains only the JSON payload
  (no console text mixed in) whenever a diff exists.
- `markdown.ts` — implemented (task 008): `reportMarkdown(findings: Finding[], risk: RiskResult):
  string`. Returns a Markdown block with `## SlopCheck` heading, risk score/level, a finding-count
  table, and per-finding bullets (`[SEVERITY]` + `` `ruleId` `` + message). Same purity
  constraints as other reporters. Selected via `slopcheck diff --format markdown`; stdout
  contains only the Markdown payload (no console text mixed in) whenever a diff exists.
- Reporters do not read files, call git, or contain rule logic. `src/cli.ts` calls exactly one
  reporter per invocation (based on `--format`/`--json`) after `scan()` and `scoreRisk()`, and is
  responsible for setting exit codes — format selection never affects the exit code.

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
