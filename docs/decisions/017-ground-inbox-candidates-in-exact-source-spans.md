# Ground inbox candidates in exact source spans

- Status: accepted
- Date: 2026-08-21

## Context

A meeting may contain no decisions, one decision, or several unrelated decisions. AI can
help identify them, but a plausible summary without source support would make triage less
trustworthy and could create a governed decision from invented context. Provider retries
and source corrections can also leave stale candidates attached to changed meeting text.

## Decision

Treat detection as replaceable analysis of the current Decision Inbox source. A successful
run may persist zero, one, or multiple ordered candidates. Persist a candidate only when at
least one model-supplied quote can be located in the stored source; save the exact matched
text and its character offsets. Reject unsupported candidates rather than weakening their
grounding or generating a fallback.

Clear previous output before every run. Mark provider failures explicitly without retaining
stale candidates, and invalidate detection whenever the title, content type, content,
participants, or meeting time changes. Candidate access inherits the inbox item's workspace
and restricted-project boundary. Detection uses the requesting user's selected AI model.

## Alternatives considered

- Persist every structurally valid AI candidate. Rejected because schema validity does not
  establish that the meeting supports the claim.
- Keep unsupported candidates with a low-confidence label. Rejected because confidence is
  not evidence and users could still promote fabricated content.
- Create a deterministic fallback candidate when AI fails. Rejected because meeting topics
  and action items are not necessarily decisions.
- Retain prior candidates after a failed rerun or source edit. Rejected because users could
  mistake stale analysis for analysis of the current source.

## Consequences

- Review interfaces can highlight precise supporting passages and explain rejected counts.
- Meetings without decisions complete cleanly instead of becoming failures.
- AI paraphrases without any verbatim supporting quote are omitted even when otherwise
  useful, favoring trust over recall.
- Human acceptance and conversion remain separate operations and can be added without
  changing the grounding contract.
