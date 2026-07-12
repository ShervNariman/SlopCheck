# Sherv OS Integration

SlopCheck participates in Sherv OS as a public deterministic code-quality tool.

- ChatGPT: executive brain, prioritization, positioning, final review.
- Cursor: primary supervised editor for broad implementation and debugging.
- Codex: tightly scoped rule, reporter, and test work.
- Linear: operational truth.
- GitHub: technical truth.

## Controls
1. Read the repository and linked Linear issue before editing.
2. Preserve deterministic behavior, stable exit codes, and backward-compatible CLI contracts.
3. Prefer rule-based checks before model-based analysis.
4. Run build, typecheck, tests, representative clean/risky diff fixtures, and reporter snapshots.
5. Never transmit repository contents, diffs, credentials, or private source code externally without explicit approval.
6. npm publishing, release tags, credentials, billing, destructive changes, and public announcements require human approval.
7. Releases document validation, exit-code impact, compatibility risk, rollback, and demo artifacts.
8. Missing integrations fail closed and are reported explicitly.
