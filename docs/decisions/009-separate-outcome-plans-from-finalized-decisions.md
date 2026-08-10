# ADR 009: Keep outcome plans separate from finalized decisions

## Status

Accepted.

## Context

DecisionFlow needs to revisit whether finalized decisions produced the intended result.
Review dates, accountable owners, assumptions, and success metrics may need operational
correction after finalization. The decision rationale and evidence captured at finalization
must remain immutable.

## Decision

Store one mutable `decision_outcome_plans` record per finalized decision. It contains the
expected outcome, success metrics, assumptions, revisit triggers, review date, and current
accountable workspace member. Outcome-plan APIs authorize through the parent decision, including its
restricted-project visibility. Workspace viewers may read visible plans; editors may create
or update them. Removing a workspace member clears their outcome ownership.

The finalized snapshot does not embed or mirror the plan. Outcome scheduling and updates add
decision-history and workspace-activity events but never rewrite finalized content.

## Consequences

- Finalized records keep their audit integrity while teams can maintain follow-up logistics.
- Outcome access automatically follows future decision and project authorization changes.
- A later outcome-assessment feature can add observed results without changing snapshot
  semantics.
- Public shared reports do not expose outcome plans unless a separately reviewed sanitized
  representation is introduced.
