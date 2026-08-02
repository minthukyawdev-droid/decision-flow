# Derive robustness from the reviewed matrix

- Status: accepted
- Date: 2026-08-02

## Context

A recommendation can appear precise while depending heavily on one weighting
choice. DecisionFlow needs to show whether the matrix leader remains stable as
priorities change without asking another language model to invent scenarios or
silently filling evidence gaps.

## Decision

Decision robustness is calculated deterministically from one score source at a
time: grounded AI scores or human scores. Analysis requires every
option–criterion pair for that source to be scored and at least two criteria.

The current criterion weights are normalized for simulation only. DecisionFlow
tests controlled single-criterion changes while proportionally rebalancing the
remaining weights, reports leader retention, evaluates recognizable priority
presets, and finds the smallest whole-percentage-point weight change that
produces a different leader.

## Alternatives considered

- Ask the AI model whether the recommendation is robust. Rejected because the
  answer would be non-deterministic and difficult to audit.
- Treat missing scores as zero. Rejected because absence of evidence is not
  negative evidence and would bias the result.
- Persist each simulated scenario. Rejected because scenarios are derived views
  and should not alter the reviewed decision record.

## Consequences

Users can distinguish robust recommendations from weight-sensitive ones and see
specific tipping points. Simulations remain reproducible and do not mutate the
approved weights, score matrix, recommendation, or finalized snapshot. Users
must close evidence gaps before robustness results are available.
