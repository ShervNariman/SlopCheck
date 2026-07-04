# SlopCheck AI Operating System (`.ai-os`)

This folder is a lightweight, markdown-based **product operating system**. It is not an agent
framework, not a workflow engine, and not a runtime. It is a set of plain files that tell any
agent (or human) working on SlopCheck:

- what we're trying to achieve
- what to work on next
- how to know when it's actually done
- what rules apply to every piece of work

Everything here is designed to be read by a human or an AI agent inside Cursor, in plain
markdown, with no tooling required to interpret it.

## The core loop

```
Goal  →  Task  →  Agent  →  Acceptance Criteria  →  Verification  →  Done
```

1. **Goal** — `current-goal.md` states the single active goal and its Definition of Done.
2. **Task** — the goal is broken into small tasks, one file each, living in `tasks/backlog/`.
3. **Agent** — each task is assigned to a focused agent role (see `agents/`). Most tasks go to
   the Implementation Agent; some go to QA or Release.
4. **Acceptance Criteria** — every task file states explicit, checkable acceptance criteria.
   No task is "done" just because code was written.
5. **Verification** — the agent (or a QA pass) actually runs the criteria: builds, tests,
   manual checks. Verification is not optional and not assumed.
6. **Done** — the task is only moved to `tasks/completed/` once every acceptance criterion is
   satisfied, or a concrete blocker is written down in a completion report.

If an agent cannot finish a task, it must **not** silently stop. It must document a specific,
actionable blocker in a completion report and leave the task in `active/` (or move it back to
`backlog/` if no progress was made), so the Manager Agent can decide what happens next.

## How to use this in Cursor

- Start a session by pointing an agent at this folder and asking it to act as the **Manager
  Agent** (see `agents/manager.md`). It will read the goal, backlog, architecture, and
  decisions, then hand off a single focused task.
- To work a specific task directly, open the task file in `tasks/active/` (or promote one from
  `tasks/backlog/`) and ask an agent to act as the **Implementation Agent** (see
  `agents/implementation.md`) using that task file as its brief.
- Use the **QA Agent** (`agents/qa.md`) to verify a task's acceptance criteria before it's
  marked complete, especially for anything touching rule detection or CLI behavior.
- Use the **Release Agent** (`agents/release.md`) for README, GitHub Action examples, npm
  publishing prep, and other developer-facing polish.

## How agents should read these files before working

Before writing any code, an agent should read, in this order:

1. `mission.md` — so it understands what SlopCheck is and is not.
2. `current-goal.md` — so it knows the active goal and Definition of Done.
3. `operating-rules.md` — so it knows the constraints that apply to all work.
4. `architecture.md` — so it understands the intended structure and doesn't reinvent it.
5. `decisions.md` — so it doesn't relitigate settled architectural choices.
6. The specific task file it has been assigned (from `tasks/active/` or `tasks/backlog/`).
7. The relevant `templates/` file, to know what "done" and "completion report" should look
   like.

## How tasks move through the system

```
tasks/backlog/    → not yet started, prioritized roughly top-to-bottom in backlog.md
tasks/active/     → currently being worked by an agent
tasks/completed/  → acceptance criteria verified, completion report attached
```

Flow:

1. The Manager Agent picks the next task from `tasks/backlog/` (usually the top unblocked item
   per `backlog.md`) and moves the task file into `tasks/active/`.
2. The Implementation Agent (or QA/Release Agent, depending on task type) works the task in
   place inside `tasks/active/`.
3. When the agent believes the work is complete, it verifies every acceptance criterion itself
   (running tests/build, re-reading the diff, etc.) and appends a completion report to the
   bottom of the task file, using `templates/completion-report.md`.
4. If everything is verified, the task file moves to `tasks/completed/` and `current-goal.md`'s
   progress checklist is updated.
5. If something is blocked, the completion report documents the concrete blocker instead of a
   fake "done," and the task stays in `active/` (or moves back to `backlog/`) until the blocker
   is resolved or the Manager Agent decides otherwise.

## File map

```
.ai-os/
  README.md              you are here
  mission.md              long-term mission and non-goals
  current-goal.md         the one active goal + Definition of Done + progress
  architecture.md         intended lightweight architecture
  decisions.md            architectural decision log
  backlog.md              prioritized MVP backlog
  operating-rules.md      rules every agent must follow

  agents/
    manager.md            plans work, sequences tasks, reviews completion reports
    implementation.md     implements one task at a time
    qa.md                 verifies acceptance criteria, tests, edge cases
    release.md             README, GitHub Action, npm publishing, dev-facing polish

  templates/
    feature-task.md
    refactor-task.md
    bug-task.md
    completion-report.md

  tasks/
    backlog/               tasks not yet started
    active/                tasks currently being worked
    completed/             tasks done and verified
```
