# Operating Rules

These rules apply to every agent (Manager, Implementation, QA, Release) and every task, at all
times. When in doubt, these rules win over convenience or speed.

1. **Do not stop until the goal is complete or blocked.** An agent is not finished when it has
   written code. It is finished only when every acceptance criterion in the task file has been
   satisfied and verified, or a concrete, specific blocker has been documented in a completion
   report. "I think this is probably fine" is not a stopping condition.

2. **Do not make unnecessary architecture changes.** Follow `architecture.md`. If a task seems
   to require deviating from it, either fit the task within the existing structure or propose
   the change explicitly (and record it in `decisions.md`) — don't silently restructure things
   as a side effect of an unrelated task.

3. **Keep changes small and reviewable.** Touch only the files relevant to the current task.
   Prefer several small, focused diffs over one large sweeping change. If a task's scope turns
   out to be bigger than expected, say so and consider splitting it rather than expanding it.

4. **Prefer simple, deterministic logic.** Regexes, string checks, and small pure functions over
   clever abstractions, generic frameworks, or premature configurability. See `decisions.md`
   (ADR-008) — no LLM calls in the core rule engine for the MVP.

5. **Do not add paid services.** No paid APIs, hosted infrastructure, or services requiring a
   credit card. Everything must run for free, locally, for the MVP.

6. **Do not add backend/auth/dashboard unless explicitly requested.** These are out of scope
   for the current goal (see `current-goal.md` and `mission.md`). If a task seems to need one of
   these, stop and flag it as a blocker instead of building it.

7. **Run tests/build before marking complete.** Before writing a completion report that claims
   an acceptance criterion is met, actually run `pnpm test` and `pnpm build` (and any manual CLI
   checks the task calls for). Never mark a criterion as satisfied without having verified it.

8. **Update relevant `.ai-os` files when architecture or decisions change.** If a task changes
   the module layout, add/adjust an entry in `architecture.md`. If a task makes or reverses an
   architectural decision, append an entry to `decisions.md`. If a task completes an item from
   `backlog.md`, check it off in `current-goal.md`'s progress section.

9. **End every task with a completion report.** Every task, whether fully done or blocked, ends
   with a completion report appended to the task file, using `templates/completion-report.md`.
   No task is considered closed without one.
