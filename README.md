# SlopCheck

**SlopCheck scans your git diff for risky patterns in added lines and gives you a short, actionable report before you merge.**

SlopCheck is a local, deterministic patch risk scanner. It looks at what changed — not your whole codebase — and flags lines that are easy to miss in a fast review: loosened types, suppressed errors, debug output, unfinished work, and broad error handling.

## What SlopCheck is not

- **Not an AI detector.** SlopCheck does not try to tell whether code was written by a human or an AI. It flags risky patterns in a diff regardless of who wrote them.
- **Not a generic linter.** ESLint and TypeScript already handle general code quality. SlopCheck focuses on a small set of high-signal patterns correlated with risky or hard-to-review patches.

## Why use it

After an AI-assisted coding session, you want to know which lines in *this patch* deserve a second look before they land. SlopCheck runs in seconds, works offline, and never sends your code anywhere.

## Current status (MVP)

This is an early MVP. What works today:

- npm package published — [`@shervnariman/slopcheck`](https://www.npmjs.com/package/@shervnariman/slopcheck)
- `slopcheck diff` — scan staged changes (falls back to unstaged)
- `--base <ref>` — diff against a base ref instead of local changes (for CI)
- Five deterministic rules (see below)
- Patch-level risk score (0–100)
- Console, JSON, and Markdown output
- Exit code 1 when risk is high or a high-severity finding exists — usable as a CI gate (see
  [GitHub Actions](#github-actions) below)

Not shipped yet: config file, automatic PR comments.

## Install and usage

Requires [Node.js](https://nodejs.org/). No install needed for one-off runs:

```bash
# Default console output
npx @shervnariman/slopcheck diff

# JSON (for tooling/CI)
npx @shervnariman/slopcheck diff --format json

# Markdown (for pasting into a PR comment)
npx @shervnariman/slopcheck diff --format markdown

# Diff against a base ref instead of local changes (used in CI, see below)
npx @shervnariman/slopcheck diff --base origin/main --format markdown
```

For a global install, the command is still `slopcheck`:

```bash
npm install -g @shervnariman/slopcheck
slopcheck diff
```

If there is no diff, SlopCheck prints:

```
No git diff found. Make a code change first, then run SlopCheck.
```

## Example output

Given a patch that adds `any`, `@ts-ignore`, a `TODO`, `console.log`, and a broad `catch`:

### Console

```
SlopCheck found 6 potential issue(s):

[MEDIUM] Added TypeScript "any": const x: any = 1;
[HIGH] Added @ts-ignore: // @ts-ignore
[LOW] Added TODO/FIXME/HACK: // TODO: fix this
[LOW] Added console.log: console.log(x);
[MEDIUM] Added broad catch block: } catch (e) {
[LOW] Added console.log: console.log(e);

Risk score: 100/100 (high) — 6 potential issue(s) found.
```

### JSON

```json
{
  "findings": [
    {
      "ruleId": "any-type",
      "severity": "medium",
      "message": "Added TypeScript \"any\": const x: any = 1;",
      "line": "const x: any = 1;"
    },
    {
      "ruleId": "ts-ignore",
      "severity": "high",
      "message": "Added @ts-ignore: // @ts-ignore",
      "line": "// @ts-ignore"
    }
  ],
  "risk": {
    "score": 100,
    "level": "high",
    "summary": "6 potential issue(s) found.",
    "findingCount": 6,
    "highCount": 1,
    "mediumCount": 2,
    "lowCount": 3
  },
  "findingCount": 6,
  "highCount": 1,
  "mediumCount": 2,
  "lowCount": 3
}
```

(JSON output is truncated above for readability; a real run includes every finding.)

### Markdown

```markdown
## SlopCheck

**Risk score:** 100/100
**Risk level:** high

| Metric | Count |
| --- | --- |
| Findings | 6 |
| High | 1 |
| Medium | 2 |
| Low | 3 |

### Findings

- **[MEDIUM]** (`any-type`) Added TypeScript "any": const x: any = 1;
- **[HIGH]** (`ts-ignore`) Added @ts-ignore: // @ts-ignore
- **[LOW]** (`todo-fixme-hack`) Added TODO/FIXME/HACK: // TODO: fix this
```

## Rules

SlopCheck only inspects **added lines** in the git diff.

| Pattern | Severity | What it catches |
| --- | --- | --- |
| TypeScript `any` | medium | Loosened typing (`const x: any = …`) |
| `@ts-ignore` | high | Type-check suppression |
| `TODO` / `FIXME` / `HACK` | low | Unfinished or deferred work |
| `console.log` | low | Debug output left in the patch |
| Broad `catch` block | medium | `catch (e) {` with no narrowing on the same line |

## Risk scoring

Findings are weighted by severity and summed into a 0–100 score:

| Severity | Points |
| --- | --- |
| high | +40 |
| medium | +20 |
| low | +10 |

The score is capped at 100. The risk level is:

- **low** — score 0–24
- **medium** — score 25–59
- **high** — score 60–100

SlopCheck exits with code 1 if any high-severity finding exists or the overall level is high.

## GitHub Actions

SlopCheck can run on pull requests via `--base <ref>`, which diffs against a base ref instead of
local staged/unstaged changes:

```bash
pnpm tsx src/cli.ts diff --base origin/main --format markdown
```

An example workflow is included at [`.github/workflows/slopcheck.yml`](.github/workflows/slopcheck.yml). It:

- Triggers on `pull_request`
- Checks out the repo with full history (`fetch-depth: 0`, required for base-ref diffing)
- Installs dependencies and builds the CLI with pnpm
- Runs `slopcheck diff --base origin/${{ github.base_ref }} --format markdown` and appends the
  result to the job's step summary (visible on the PR's checks tab)
- Fails the check if SlopCheck's exit code is non-zero (high-severity finding or high overall
  risk), since the run's exit code is the workflow step's exit code

This uses only free GitHub-hosted runners — no paid services or third-party actions requiring
signup.

## Roadmap

- **More rules** — additional high-signal patterns as the set matures
- **Config file** — enable/disable rules, severity overrides
- **PR comment support** — post Markdown results directly on a pull request (beyond the step
  summary the current GitHub Action example writes to)

## Development

Clone and run from source:

```bash
git clone https://github.com/ShervNariman/SlopCheck.git
cd SlopCheck
pnpm install
pnpm build
pnpm tsx src/cli.ts diff
```

```bash
pnpm typecheck   # TypeScript check
pnpm test        # Vitest (43 tests)
pnpm build       # Bundle to dist/
```

## License

MIT
