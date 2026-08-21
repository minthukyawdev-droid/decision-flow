# Derive portfolio risk from operational state

## Context

Leadership needs a cross-project view of decisions that are stalled, blocked, overdue,
or missing follow-through. A single AI-generated quality score would be difficult to
explain and could imply unsupported certainty about whether a human decision is good.
The application already stores auditable lifecycle, approval, execution, and outcome
facts that can identify where intervention is required.

## Decision

Build the executive portfolio from decisions visible through the user's active workspace
and restricted-project authorization. Derive each risk signal deterministically from
stored state: stalled editable work, incomplete recommendation or finalization, overdue
or rejected approvals, blocked or overdue execution actions, missing execution or outcome
plans, overdue outcome reviews, and completed reviews that missed expectations.

Display the reasons and lifecycle health stages with every decision. Provide the same
filters to the screen and CSV export. Keep export fields at the portfolio-summary level;
exclude raw source text, action descriptions, reviewer details, and secure tokens.

## Consequences

- Leaders can trace every attention flag to a concrete operational fact and take action.
- Portfolio counts automatically respect workspace and restricted-project visibility.
- Filters are reusable through the URL and exports reproduce the same authorized view.
- The dashboard measures workflow and follow-through, not subjective decision quality.

## Alternatives considered

- Generate an AI decision-quality score. Rejected because it is difficult to validate,
  can hide missing evidence, and does not identify the operational action required.
- Copy portfolio state into a reporting table. Rejected initially because the current
  dataset can be aggregated from authoritative records without synchronization risk.
- Export full decision and task details. Rejected because executive reporting does not
  require private source, action, or reviewer content.
