# Keep comments outside finalized snapshots

- Status: accepted
- Date: 2026-08-13

## Context

Teams need to discuss a decision before and after it is finalized. Copying comments
into the immutable decision snapshot would mix conversational collaboration with the
reviewed evidence and chosen outcome, while disabling all discussion at finalization
would prevent useful follow-up questions.

## Decision

Store decision comments as separate workspace-owned records linked to a decision and
author. Apply the normal decision and restricted-project visibility rules when listing,
creating, or deleting them. Workspace viewers may read comments; owners, administrators,
and members may post. Authors may delete their own comments, and workspace owners or
administrators may moderate any comment. Finalized decisions continue to accept comments
without modifying their snapshot, while archived decisions expose discussion read-only.

Record generic add/remove history and workspace activity events, but never copy comment
bodies into activity metadata, public reports, or finalized snapshots. A later threaded
discussion feature can extend these records without changing this boundary.
Allow a comment to target the overall decision, a reviewed option, persisted criterion,
reviewed or recommendation risk, or the current recommendation. Publish valid targets from
the backend and require comment creation to use one of those server-issued references. Persist a
display-label snapshot with the comment so an existing discussion stays understandable if a
draft field is later renamed; reject stale references for new comments. After finalization,
derive targets from the immutable snapshot rather than mutable live fields.

## Alternatives considered

- Copy comments into the final snapshot. Rejected because ordinary collaboration would
  change what must remain an immutable record of reviewed decision content.
- Disable comments after finalization. Rejected because teams need clarification and
  follow-up discussion after a choice is recorded.
- Allow every editor to delete every comment. Rejected because routine moderation should
  be limited to the author and administrative roles.
- Let the browser construct arbitrary field links. Rejected because it would permit stale or
  fabricated references and make finalized comment context difficult to audit.

## Consequences

Teams can collaborate throughout the decision lifecycle without weakening finalization.
Comments inherit existing access controls and remain private to authorized members. A
deleted comment body is not recoverable through the comment API, although the audit and
activity records retain that a deletion occurred. Archived decisions preserve discussion
as read-only history. Server-issued field targets add one read endpoint and preserve a label
snapshot, but keep context links deterministic and independently verifiable.
