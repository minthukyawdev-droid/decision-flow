# Finalize outcome assessments with versioned snapshots

- Status: accepted
- Date: 2026-08-10

## Context

Outcome-assessment drafts need to remain easy to revise while evidence is being
collected. Once a team declares a review complete, the recorded result must remain
auditable even if the outcome plan, owner profile, or surrounding project metadata
changes later. A network retry must not create a second record or rewrite completion
metadata.

## Decision

Keep one assessment per outcome plan and transition it from `draft` to `completed`
through a dedicated, editor-only endpoint. The backend validates evidence
completeness, records the completing user and timestamp, and stores a versioned JSON
snapshot containing the finalized-decision identity, review-plan baseline, and all
assessment content.

The transition is retry-safe: completing an already completed assessment returns the
existing record. Draft updates after completion are rejected. The live plan remains a
separate mutable follow-up record, while the completion snapshot preserves exactly
what was reviewed.

## Alternatives considered

- Keep every assessment editable and rely only on activity history. This cannot prove
  which exact evidence was accepted as the completed review.
- Create a second completed-assessment table. This adds a duplicate lifecycle and
  synchronization boundary without product value while only one assessment is allowed
  per outcome plan.
- Lock the outcome plan together with the assessment. This would prevent legitimate
  operational changes to review ownership and scheduling after the historical review.

## Consequences

- Teams get an explicit irreversible boundary and an auditable completed record.
- Plan edits cannot silently rewrite historical outcome evidence.
- Snapshot schema changes require a new `schema_version`; existing snapshots are not
  migrated in place.
- Privacy-driven deletion of the parent decision remains a separate lifecycle action
  and may cascade to the assessment.
