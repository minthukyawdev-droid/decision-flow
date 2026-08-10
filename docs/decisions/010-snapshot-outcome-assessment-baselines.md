# ADR 010: Snapshot outcome baselines when assessment starts

## Status

Accepted.

## Context

Outcome plans remain editable after a decision is finalized. If an assessment always read
the plan's latest success metrics and assumptions, editing that plan could silently change
what an in-progress assessment claims to evaluate.

## Decision

On the first outcome-assessment save, copy the plan's success metrics and assumptions into
the assessment. Metric results and assumption findings must reference that captured baseline.
Later plan edits do not rewrite it. The assessment remains an editable draft in this phase;
completion and an immutable completed-review snapshot are separate lifecycle work.

Assessment authorization is resolved through the parent decision, including active-workspace
and restricted-project access. Viewers can read visible drafts but cannot edit them.

## Consequences

- A draft has a stable and auditable evaluation target.
- Plan edits can prepare future reviews without rewriting an assessment already underway.
- The API returns every captured metric and assumption, using `unassessed` placeholders for
  entries without observations.
- Resetting or replacing a mistaken baseline will require an explicit future workflow rather
  than happening implicitly through plan edits.
