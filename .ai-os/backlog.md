# MVP Backlog

Prioritized, top to bottom. The Manager Agent picks the topmost item in `tasks/backlog/` that
isn't blocked, moves it to `tasks/active/`, and assigns it to the suggested agent. Items build
on each other in this order — don't skip ahead unless a task is explicitly blocked and the
Manager Agent documents why.

Corresponding task files live in `tasks/backlog/` as `NNN-slug.md`. Only item 1 (`001`) has a
fully written task file today; the Manager Agent writes the next task file (using
`templates/feature-task.md` or `refactor-task.md`) once the previous one is completed, so each
task reflects the actual state of the code at the time it starts.

---

## 1. Clean CLI structure

**Goal:** Refactor `src/cli.ts` so the entrypoint only wires commands, while git-diff reading,
rule scanning, and the finding model live in their own modules.

**Why it matters:** Everything else in this backlog (rule engine, reporters, tests) needs a
codebase that isn't a single 90-line file mixing five responsibilities. This is the
foundation every later item builds on.

**Acceptance criteria:**
- `src/cli.ts` remains the CLI entrypoint but contains no diff-reading or rule-scanning logic.
- Git diff logic lives in its own module.
- Rule scanning logic lives in its own module.
- The `Finding` type is defined in its own module, separate from scanning logic.
- `slopcheck diff` behavior (output and exit code) is unchanged.
- The sample scan still detects `any`, `TODO`, `console.log`, and a broad `catch`.
- `pnpm tsx src/cli.ts --help` and `pnpm tsx src/cli.ts diff` both work.
- No unnecessary dependencies added.

**Suggested agent:** Implementation Agent

---

## 2. Add rule engine

**Goal:** Introduce a small rule engine (`src/engine/scan.ts`) plus a `Rule` interface
(`src/rules/types.ts`) and a rule registry (`src/rules/index.ts`), replacing the inline
if-statements from the old `scanDiff`.

**Why it matters:** Rules need to be independently addable/removable/testable. Inline
if-statements don't scale past a handful of checks and can't be unit tested in isolation.

**Acceptance criteria:**
- A `Rule` interface exists describing `id`, `description`, `severity`, and a `check` function.
- A rule registry lists all active rules in one place.
- The engine runs every registered rule against the diff and returns `Finding[]`.
- Existing detections (from item 1) still fire identically through the new engine.
- Adding a new rule requires only a new file + one registry line (documented in
  `architecture.md` if not already).

**Suggested agent:** Implementation Agent

---

## 3. Add findings model

**Goal:** Formalize the `Finding` type in `src/findings/types.ts` as the single shape used by
every rule, the engine, the risk scorer, and every reporter.

**Why it matters:** A shared, stable finding shape is what lets reporters and the risk scorer
be written independently of rule internals, and is a prerequisite for JSON/Markdown reporters
and risk scoring.

**Acceptance criteria:**
- `Finding` type includes at least `ruleId`, `severity`, `message`, and (if available) `line`.
- All rules and the engine import this shared type instead of redefining it locally.
- Existing behavior (console output, detections) is unchanged.
- Type-checks cleanly (`tsc`/build passes).

**Suggested agent:** Implementation Agent

---

## 4. Add core rules

**Goal:** Formalize the current inline checks as discrete rule modules under `src/rules/`:
added `any`, `@ts-ignore`, `TODO`/`FIXME`/`HACK`, `console.log`, broad `catch`.

**Why it matters:** These are the rules that give SlopCheck its initial value. They need to be
individually testable and tunable (severity, message) without touching unrelated rules.

**Acceptance criteria:**
- One rule module per pattern, each exporting a `Rule` matching the interface from item 2.
- Registered in the rule registry.
- Each rule's severity matches current behavior (`any`→medium, `@ts-ignore`→high,
  `TODO/FIXME/HACK`→low, broad catch→medium, `console.log`→low), unless a decision changes
  that (in which case log it in `decisions.md`).
- Running against `src/example.ts`'s diff still surfaces all five findings.

**Suggested agent:** Implementation Agent

---

## 5. Add risk scoring

**Goal:** Add `src/scoring/risk-score.ts` that turns `Finding[]` into a simple, explainable
score/verdict (e.g. counts per severity + an overall `pass`/`warn`/`block` verdict).

**Why it matters:** Raw findings are useful, but a single verdict is what makes SlopCheck
usable as a fast go/no-go signal for a reviewer or a CI gate.

**Acceptance criteria:**
- A pure function takes `Finding[]` and returns a score/verdict object.
- The scoring formula is simple and documented in a code comment or `architecture.md`.
- CLI exit code is derived from the verdict (e.g. non-zero on `block`), replacing the current
  ad hoc "any high severity" check with the same or better behavior.
- Unit-testable in isolation from the CLI and git.

**Suggested agent:** Implementation Agent

---

## 6. Add console reporter

**Goal:** Extract current terminal output into `src/reporters/console.ts` as a pure function of
`(findings, score) => void` (or `=> string` printed by the caller).

**Why it matters:** Establishes the reporter pattern that the JSON and Markdown reporters will
follow, and gets output formatting out of `cli.ts`.

**Acceptance criteria:**
- `cli.ts` calls the console reporter instead of printing directly.
- Output is equivalent to (or clearly improved from) current output, including the score
  verdict from item 5.
- Reporter has no dependency on git, rules, or the engine — only on the `Finding`/score types.

**Suggested agent:** Implementation Agent

---

## 7. Add JSON reporter

**Goal:** Add `src/reporters/json.ts` and a `--json` (or `--format json`) CLI flag that outputs
`{ findings, score }` as JSON instead of human-readable text.

**Why it matters:** Enables CI and tooling integration (including the future GitHub Action)
without scraping terminal text.

**Acceptance criteria:**
- `slopcheck diff --json` prints valid, parseable JSON containing findings and the score.
- No human-readable text is mixed into stdout when `--json` is used (so it's pipeable).
- Exit code behavior from item 5 is unchanged regardless of output format.

**Suggested agent:** Implementation Agent

---

## 8. Add Markdown reporter

**Goal:** Add `src/reporters/markdown.ts` and a `--markdown` (or `--format markdown`) flag that
outputs a Markdown block suitable for pasting into a PR comment.

**Why it matters:** Makes findings easy to share in a PR/code review context, which is the
primary place SlopCheck's output needs to be actionable.

**Acceptance criteria:**
- `slopcheck diff --markdown` prints a well-formed Markdown summary (e.g. a table or bulleted
  list grouped by severity, plus the overall verdict).
- Renders sensibly when pasted into a GitHub PR comment (headings, lists, or tables — no raw
  ANSI codes or terminal-only formatting).

**Suggested agent:** Implementation Agent

---

## 9. Add tests

**Goal:** Add Vitest tests covering the rule engine and each core rule (`any`, `@ts-ignore`,
`TODO`/`FIXME`/`HACK`, `console.log`, broad `catch`), plus basic reporter output shape tests.

**Why it matters:** Rules and scoring are the core value of the product; regressions here
directly reduce trust in the tool. Tests are also required by `operating-rules.md` before any
task can be marked complete going forward.

**Acceptance criteria:**
- Each core rule has at least one positive test (detects the pattern) and one negative test
  (does not false-positive on safe code).
- The engine has a test verifying it aggregates findings from multiple rules correctly.
- `pnpm test` passes.

**Suggested agent:** QA Agent

---

## 10. Add README

**Goal:** Write a root `README.md` covering what SlopCheck is, install instructions, usage
(`slopcheck diff`, flags), example output, and a short "why" section drawn from `mission.md`.

**Why it matters:** This is an open-source CLI — without a README, no one can install or trust
it. It's also the primary place the mission and non-goals get communicated to users.

**Acceptance criteria:**
- Root `README.md` exists with install, usage, example output (console + one alt format), and
  a short project description consistent with `mission.md`.
- Commands and flags documented in the README actually exist and work as described.

**Suggested agent:** Release Agent

---

## 11. Add GitHub Action example

**Goal:** Provide a documented example GitHub Actions workflow that runs SlopCheck against a
pull request's diff, using the JSON or Markdown reporter.

**Why it matters:** CI usage is a primary intended use case (catch risky patches "before they
land," not just when a developer remembers to run the CLI locally).

**Acceptance criteria:**
- An example workflow YAML exists (in the README and/or `.github/workflows/`) showing how to
  run SlopCheck on `pull_request` events.
- The example is copy-pasteable and uses only free GitHub-hosted runners (no paid services).

**Suggested agent:** Release Agent

---

## 12. Prepare npm publishing

**Goal:** Make the package ready to `npm publish`: correct `package.json` metadata (`name`,
`version`, `bin`, `files`/`exports`, `license`, `repository`), verified build output, and a
working global/local install path.

**Why it matters:** The MVP isn't reachable by real users until it can be installed via
`npm install -g slopcheck` (or `npx slopcheck`).

**Acceptance criteria:**
- `package.json` has a `bin` entry pointing at the built CLI output.
- `pnpm build` produces a working `dist/` output that can be executed directly (e.g.
  `node dist/cli.js --help`).
- `files`/`.npmignore` are set so only necessary files are published.
- A dry-run publish (`npm pack` or `npm publish --dry-run`) succeeds and includes the expected
  files.

**Suggested agent:** Release Agent
