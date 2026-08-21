# Require human promotion from inbox candidate to decision

- Status: accepted
- Date: 2026-08-21

## Context

Grounded AI detection can identify plausible decisions in a meeting, but detection alone
does not establish that the organization wants to govern each candidate as a decision.
Automatically creating decisions would clutter the library, weaken ownership, and allow a
model to cross the boundary between analysis and organizational commitment.

## Decision

Keep every detected candidate pending until an authorized workspace editor explicitly
dismisses it or promotes it. Allow dismissed candidates to be restored. Promotion lets the
reviewer confirm the decision title and context, then creates one idempotent draft decision,
copies the meeting into that draft as its source, and initializes structured review from the
detected question and known stakeholders.

Always inherit the inbox item's project route. Do not allow promotion into a broader or
different visibility boundary because the copied meeting source may contain restricted
information. Record the reviewer, review time, and promoted decision link on the candidate.
After promotion, prevent detection reruns and source-input edits from silently destroying
that lineage. Inbox dismissal remains organizational cleanup and does not erase review state.

## Alternatives considered

- Automatically create a draft for every candidate. Rejected because meetings often contain
  tentative or irrelevant choices and one meeting can generate several candidates.
- Let promotion choose any project. Rejected because copying restricted meeting content into
  a broader project could disclose private source material.
- Create a new decision on every repeated promotion request. Rejected because browser retries
  and double submissions must not duplicate governed records.
- Copy only the AI summary into the decision. Rejected because later review and audit need the
  original meeting source, not only model-authored text.

## Consequences

- The decision library reflects explicit human intent instead of raw AI recall.
- Reviewers can triage candidates without losing dismissed analysis.
- Promoted drafts resume in the normal decision workflow with options and criteria still
  visibly incomplete rather than invented.
- Correcting a promoted meeting source requires handling the resulting decision deliberately;
  the system will not silently rewrite its origin.
