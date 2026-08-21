# Store meeting imports as private inbox records

## Context

Meeting notes may contain zero, one, or several decisions. Creating a decision directly
from every import would mix unreviewed source material with governed decision records,
create duplicates, and make connector retries difficult to manage. Meeting source and
participant data may also be more sensitive than the eventual decision summary.

## Decision

Persist each authenticated import as a mutable Decision Inbox record before candidate
detection or decision creation. Store source identity, notes or transcript content,
participants, meeting time, processing status, creator, and an optional project route.
Use explicit processing transitions so future asynchronous detection can retry safely
and expose a grounded failure reason.

Scope every item to the active workspace. Unassigned items are visible workspace-wide;
project-routed items inherit that project's restricted access. List APIs return only a
short preview, while the full source requires authorized item-level access. Do not copy
meeting content, participants, or failure details into workspace activity or public
reports. Allow authorized editors to delete intake records for privacy and correction.

## Consequences

- Connectors can ingest meeting material without prematurely creating decisions.
- Future multi-decision detection has a durable, retryable source record.
- Restricted-project and viewer rules apply before an item enters the decision workflow.
- Inbox records remain mutable intake data and are not part of immutable finalization.

## Alternatives considered

- Create a draft decision for every meeting import. Rejected because many meetings do
  not contain a decision and one meeting may contain several unrelated decisions.
- Store imports as decision transcripts immediately. Rejected because that requires a
  decision identity before human triage and weakens project-routing control.
- Publish import activity to the workspace feed. Rejected because meeting titles,
  participants, source URLs, and failures can reveal private context before review.
