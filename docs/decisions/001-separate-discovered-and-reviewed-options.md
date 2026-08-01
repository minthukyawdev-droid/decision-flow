# Separate discovered and reviewed options

- Status: accepted
- Date: 2026-08-02

## Context

Some meeting sources describe a decision problem without naming alternatives.
DecisionFlow should help users discover plausible options without presenting AI
hypotheses as facts discussed or approved by the team.

## Decision

Readiness is calculated deterministically from extracted decision structure. AI
option discovery is returned separately from explicit and reviewed options.
Discovered options include rationale, confidence, and grounded source evidence
when available. A suggestion becomes a reviewed option only after an explicit
user action.

## Alternatives considered

- Automatically add AI suggestions to extracted options. Rejected because it
  obscures provenance and can change the decision scope without consent.
- Block decisions with missing options and provide no assistance. Rejected
  because it leaves users stranded when meetings are exploratory.
- Treat readiness as an AI-generated score. Rejected because readiness gates
  should be predictable, testable, and independent of model variability.

## Consequences

Clients must display suggestion provenance and provide an acceptance action.
Readiness remains stable across AI models, while suggestion quality can improve
independently. Users may still need to add or edit options manually.
