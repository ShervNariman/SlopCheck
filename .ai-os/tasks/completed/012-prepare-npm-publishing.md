# Task 012: Prepare npm publishing

## Goal

Make SlopCheck's `package.json` and build output ready for `npm publish` — correct metadata,
a working `bin` entry with a proper shebang, and a verified packed tarball — without actually
publishing the package.

## Context

Tasks 001–011 are complete: SlopCheck is a working local-first TypeScript CLI (`slopcheck diff`,
with `--base`, `--format`, `--json`) with console/JSON/Markdown reporters, risk scoring, a
43-test Vitest suite, a public README, and a GitHub Action example. Per `.ai-os/backlog.md` item
12, the final MVP step is npm-publish readiness.

**Current `package.json` state:**
```json
{
  "name": "SlopCheck",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": { "build": "tsup", "typecheck": "tsc --noEmit", "test": "vitest run --passWithNoTests", "dev": "tsx src/cli.ts" },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  ...
}
```

Problems to fix:
- `"name": "SlopCheck"` is not npm-safe (uppercase letters are invalid in npm package names).
- `"main": "index.js"` points at a file that doesn't exist; build output is `dist/cli.js` +
  `dist/cli.d.ts` (per `tsup.config.ts`: `entry: ["src/cli.ts"]`, `outDir: "dist"`, `dts: true`).
- No `bin` entry — nothing maps a `slopcheck` command to `dist/cli.js`.
- No `files` array — an npm publish today would include everything not `.gitignore`d that isn't
  already excluded by npm defaults (source, tests, `.ai-os/`, `.github/`, etc.), which is far
  more than a consumer needs.
- No `repository`, `bugs`, `homepage`, empty `description`/`keywords`/`author`.
- `dist/cli.js` (verified via `pnpm build`) has no `#!/usr/bin/env node` shebang, so it can't be
  invoked directly as an executable once installed as a `bin`.
- No `prepublishOnly` script to guarantee a fresh build happens before any future publish.

**Constraint from the task brief:** package name must be npm-safe and lowercase. Prefer
`"slopcheck"` if available later; if not, prepare for a scoped name like
`"@shervnariman/slopcheck"`. Do not actually publish or check npm registry availability as part
of this task — just make the metadata correct and consistent with the chosen name.

## Acceptance Criteria

- [x] `package.json` `name` is npm-safe and lowercase (`"slopcheck"`, documented as the
      preferred name; scoped fallback noted in the completion report if relevant).
- [x] `package.json` includes: `name`, `version`, `description`, `type`, `bin` (mapping
      `slopcheck` to the built CLI), `files` (includes `dist` and `README.md`, excludes
      source-only/internal folders), `scripts` (`build`, `typecheck`, `test`, `dev`,
      `prepublishOnly`), `repository`, `bugs`, `homepage`, `keywords`, `author`, `license`.
- [x] The built CLI (`dist/cli.js`) has a `#!/usr/bin/env node` shebang so it works as a `bin`
      entry point.
- [x] `pnpm build` produces usable `dist/` output (`dist/cli.js`, `dist/cli.d.ts`).
- [x] `node dist/cli.js --help` runs successfully.
- [x] `pnpm pack` succeeds without publishing.
- [x] The packed tarball's file list is inspected and confirmed to include `dist/`,
      `package.json`, and `README.md`, and to exclude `.ai-os/`, `tests/`, `src/` (unless
      intentionally kept for source maps/debugging — document the decision either way),
      `.github/`, `node_modules/`, and other internal-only files.
- [x] README includes a short "Future npm usage" (or similarly named) section clearly marked as
      upcoming/not yet published, showing what installation will look like once published.
- [x] No `src/` behavior changes except what's strictly required for the CLI binary to work
      (i.e. the shebang).
- [x] No unnecessary dependencies are added.
- [x] `pnpm build` passes.
- [x] `pnpm typecheck` passes.
- [x] `pnpm test` passes; the existing 43 tests still pass.
- [x] `pnpm tsx src/cli.ts diff --help` still works.
- [x] `node dist/cli.js diff --help` works.

## Done Means

This task is done only when `package.json` is npm-publish-ready, `pnpm pack` succeeds and its
contents have been inspected and confirmed correct, every acceptance criterion above has been
verified by actually running the relevant commands, and a completion report is appended below —
with `npm publish` never actually run.

## Files likely affected

- `package.json` — name, description, bin, files, scripts, repository, bugs, homepage, keywords,
  author, license.
- `tsup.config.ts` — add a shebang banner for `dist/cli.js` (most direct way to get tsup to emit
  `#!/usr/bin/env node`).
- `README.md` — add a short "Future npm usage" section.
- `.ai-os/current-goal.md` — check off "npm publishing prep is complete" and "012 — Prepare npm
  publishing" once complete.
- `.ai-os/architecture.md` — note npm-publish readiness in "Current state" if relevant.

## Tests to run

- `pnpm build`
- `pnpm typecheck`
- `pnpm test`
- `pnpm tsx src/cli.ts diff --help`
- `node dist/cli.js --help`
- `node dist/cli.js diff --help`
- `pnpm pack` (inspect the resulting tarball's file list, e.g. via `tar -tzf` or `npm pack --dry-run`)

## Non-goals

- Do not run `npm publish` — this task only prepares for it.
- Do not add release automation (e.g. a publish GitHub Action) — that's a future item.
- Do not add a config file loader.
- Do not add new rules.
- Do not change risk scoring logic.
- Do not add backend/auth/dashboard.
- Do not register or reserve the npm package name — just prepare consistent metadata.

## Suggested agent

Release Agent (package metadata, README), with Implementation Agent support (shebang/build
config change if `src`-adjacent code needs touching)

---

## Completion Report

**Status:** Complete

**Agent:** Release (package metadata, README), Implementation (shebang/build config)

**Date:** 2026-07-04

### Acceptance criteria results

- [x] `name` is npm-safe/lowercase — changed `"SlopCheck"` → `"slopcheck"`. No npm-registry
  availability check was performed (out of scope, per Non-goals); if `"slopcheck"` turns out to
  be taken when actually publishing, the documented fallback is a scoped name like
  `"@shervnariman/slopcheck"` (would require updating `name` and the `bin` key stays the same).
- [x] `package.json` fields — added/updated `name`, `version` (kept `1.0.0`), `description`
  (one sentence grounded in `mission.md`), `type: "module"` (already present), `bin: {
  "slopcheck": "dist/cli.js" }`, `files: ["dist", "README.md"]`, `scripts` now includes `build`,
  `typecheck`, `test`, `dev` (unchanged) plus new `prepublishOnly: "pnpm build"`, `repository`
  (git+https URL), `bugs` (issues URL), `homepage` (README anchor), `keywords` (6 relevant
  terms), `author` (placeholder name — see follow-ups), `license: "ISC"` (unchanged). Removed
  the stale `"main": "index.js"` field, which pointed at a nonexistent file.
- [x] Shebang — added `banner: { js: "#!/usr/bin/env node" }` to `tsup.config.ts`; verified
  `dist/cli.js` line 1 is `#!/usr/bin/env node` after `pnpm build`.
- [x] `pnpm build` produces `dist/cli.js` (5.96 KB) and `dist/cli.d.ts` — verified, exit 0.
- [x] `node dist/cli.js --help` — exit 0, prints the same usage as `pnpm tsx src/cli.ts --help`.
- [x] `pnpm pack` — exit 0, produced `slopcheck-1.0.0.tgz` (removed after inspection, not
  committed).
- [x] Tarball contents inspected two ways: `pnpm pack`'s own "Tarball Contents" summary and
  `tar -tzf slopcheck-1.0.0.tgz`. Both list exactly `dist/cli.js`, `dist/cli.d.ts`,
  `package.json`, `README.md` — no `.ai-os/`, `tests/`, `src/`, `.github/`, `node_modules/`, or
  any other internal file. `src/` is intentionally excluded (consumers only need the built
  `dist/` output; no source maps are generated per `tsup.config.ts`).
- [x] README "Future npm usage (not yet published)" section added, explicitly stating SlopCheck
  isn't published yet, showing the intended `npx slopcheck diff` / `npm install -g slopcheck`
  usage, and pointing back at the current local install steps.
- [x] No `src/` changes — only `tsup.config.ts` (build banner) and `package.json`/`README.md`
  were touched.
- [x] No new dependencies — `dependencies`/`devDependencies` unchanged.
- [x] `pnpm build` — exit 0.
- [x] `pnpm typecheck` — exit 0.
- [x] `pnpm test` — exit 0, **7 test files / 43 tests passed**, unchanged from before this task.
- [x] `pnpm tsx src/cli.ts diff --help` — exit 0, documents `--format`/`--json`/`--base`.
- [x] `node dist/cli.js diff --help` — exit 0, identical output to the `tsx` run.

### Files changed

- `package.json` — full npm-publish-ready metadata rewrite (see above); removed stale `main`
  field.
- `tsup.config.ts` — added a `banner.js` shebang so `dist/cli.js` is directly executable.
- `README.md` — added "Future npm usage (not yet published)" section; updated the "npm package"
  roadmap bullet to reflect that `package.json`/packaging prep is done but publishing itself
  hasn't happened.
- `.ai-os/tasks/active/012-prepare-npm-publishing.md` — checked criteria, this completion
  report.
- `.ai-os/current-goal.md` — checked "npm publishing prep is complete" and "012 — Prepare npm
  publishing".
- `.ai-os/architecture.md` — added a short note that the package is npm-publish-ready (metadata,
  shebang, verified `pnpm pack`) but not yet published.

### Commands run to verify

```
pnpm build
pnpm typecheck
pnpm test
pnpm tsx src/cli.ts diff --help
node dist/cli.js --help
node dist/cli.js diff --help
pnpm pack
tar -tzf slopcheck-1.0.0.tgz
# tarball removed after inspection
```

- `pnpm build`: exit 0, `dist/cli.js` (with shebang) and `dist/cli.d.ts` built.
- `pnpm typecheck`: exit 0.
- `pnpm test`: exit 0, "Test Files 7 passed (7)", "Tests 43 passed (43)".
- `pnpm tsx src/cli.ts diff --help`: exit 0.
- `node dist/cli.js --help`: exit 0, correct top-level usage.
- `node dist/cli.js diff --help`: exit 0, correct `diff` usage including `--base`.
- `pnpm pack`: exit 0, tarball `slopcheck-1.0.0.tgz` created; "Tarball Contents" listed exactly
  `dist/cli.d.ts`, `dist/cli.js`, `package.json`, `README.md`.
- `tar -tzf slopcheck-1.0.0.tgz`: confirmed the same 4 files under `package/`, nothing else.
- `npm publish` was **not** run at any point.

### Blockers (if any)

None. Task completed fully.

### `.ai-os` updates made

- `current-goal.md`: checked "npm publishing prep is complete (package metadata, `bin` entry,
  build output verified)" under Definition of Done, and "012 — Prepare npm publishing" under
  Progress. This completes all 12 numbered backlog items for the current MVP goal.
- `architecture.md`: added a note under "Current state" that npm-publish prep (task 012) is
  complete — metadata, shebang, and a verified `pnpm pack` — but the package has not been
  published to the registry.

### Suggested follow-ups

- The MVP's Definition of Done is now fully checked off. The Manager Agent should consider
  replacing `current-goal.md`'s contents with the next goal per `.ai-os/backlog.md` (post-MVP
  items, e.g. config file support, more rules, actual `npm publish`, PR comment posting).
- `"author": "Sherv Nariman"` was inferred from the `repository`/`homepage` GitHub username
  used elsewhere in the README (`ShervNariman`) — confirm this is the correct name/handle (or
  an email) before actually publishing.
- Before running the real `npm publish` in the future, log in with `npm login`, double-check
  `"slopcheck"` is still unclaimed on the registry (or switch to the scoped fallback
  `"@shervnariman/slopcheck"` and add `"publishConfig": { "access": "public" }` if scoped), and
  bump `version` if `1.0.0` doesn't reflect the intended first published release.
