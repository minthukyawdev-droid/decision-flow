# Use explainable overlap for decision precedents

- Status: accepted
- Date: 2026-08-12

## Context

DecisionFlow should surface relevant prior decisions while a team prepares a new
one. Early decision libraries may not contain enough records to justify embedding
infrastructure, and users need to understand why a precedent was retrieved without
mistaking similarity for a recommendation or quality score.

## Decision

Rank only finalized decisions visible to the requesting user. Calculate a
deterministic similarity percentage from normalized overlap in decision topic text,
reviewed criteria, reviewed options, and project assignment. Omit weak matches and
return explicit match reasons with the historical selected option and outcome
status. Do not use raw transcript text as matching input or expose it in results.

## Alternatives considered

- Generate matches with a language model. Rejected because results would vary,
  add latency and provider dependency, and be difficult to audit.
- Store and query vector embeddings immediately. Deferred because it adds model,
  indexing, migration, and re-embedding operations before the corpus requires that
  complexity.
- Match every decision regardless of lifecycle. Rejected because unfinished drafts
  are not reliable organizational precedents.
- Return same-project decisions without a relevance threshold. Rejected because
  project membership alone can create noisy or misleading matches.

## Consequences

Matches are fast, testable, provider-independent, and explainable. Restricted
project access remains authoritative because candidate retrieval uses the normal
decision visibility boundary. The token-overlap approach may miss semantically
related decisions that use different language; a future embedding implementation
can replace ranking while preserving the endpoint, authorization rules, threshold,
and explanation contract.
