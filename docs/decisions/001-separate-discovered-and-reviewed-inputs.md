# Separate discovered and reviewed decision inputs

- Status: accepted
- Date: 2026-08-02

## Context

Some meeting sources describe a decision problem without naming alternatives or
explicit evaluation criteria. DecisionFlow should help users discover plausible
options and criteria without presenting AI hypotheses as facts discussed or
approved by the team.

## Decision

Readiness is calculated deterministically from extracted decision structure. AI
option and criterion discovery are returned separately from explicit and
reviewed decision inputs. Suggestions include rationale, confidence, and
grounded source evidence when available. A suggestion becomes a reviewed input
only after an explicit user action.

## Alternatives considered

- Automatically add AI suggestions to extracted inputs. Rejected because it
  obscures provenance and can change decision scope or evaluation logic without
  consent.
- Block decisions with missing inputs and provide no assistance. Rejected
  because it leaves users stranded when meetings are exploratory.
- Treat readiness as an AI-generated score. Rejected because readiness gates
  should be predictable, testable, and independent of model variability.

## Consequences

Clients must display suggestion provenance and provide separate acceptance
actions for options and criteria. Readiness remains stable across AI models,
while suggestion quality can improve independently. Users may still need to add
or edit decision inputs manually.
