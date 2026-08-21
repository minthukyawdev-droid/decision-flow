# Separate execution actions from finalized decisions

## Context

A finalized decision must remain an immutable account of what was chosen and why, but
the work required to implement it changes over time. Owners, due dates, priorities,
blockers, and completion state are operational facts rather than decision evidence.

## Decision

Store execution actions as workspace-owned records linked to a finalized decision, not
inside its finalization snapshot. Each action has one active non-viewer assignee who can
currently access the parent decision, including its restricted-project boundary. Actions
become read-only when the decision is archived and are deleted with the parent decision.

Record action creation, updates, and removal in decision history. Publish safe workspace
activity without action descriptions. Assignment, due-soon, and overdue alerts are direct
recipient-only events. Persist reminder timestamps and lock automation candidates so the
hourly production job is retry-safe and does not duplicate deadline notifications.

The My Work API aggregates assigned actions, owned incomplete outcome reviews, and direct
mentions visible in the user's active workspace. It also includes exact reviewer-bound pending
approvals from the existing approval inbox; project metadata is omitted unless the reviewer has
normal decision access through the active workspace.

## Consequences

- Teams can change execution state without rewriting the immutable decision record.
- Restricted-project and workspace removal rules automatically constrain action access.
- Deadline automation creates auditable in-app notifications without introducing a second
  external delivery dependency.
- Progress is a deterministic count of stored action states, not an AI quality score.

## Alternatives considered

- Copy action state into the finalized snapshot. Rejected because ordinary execution
  updates would violate finalization immutability.
- Use extracted transcript action items directly as tasks. Rejected because extraction is
  evidence review; accountability requires explicit human assignment and dates.
- Broadcast assignments and blocker text to workspace activity. Rejected because direct
  responsibility and operational details may be sensitive, especially in restricted projects.
