# ADR 007: Scope workspace activity to existing access boundaries

## Status

Accepted.

## Decision

DecisionFlow stores a workspace-level collaboration activity stream for important
team, project, and decision lifecycle changes. Each event records its workspace,
actor, safe human-readable summary, entity reference, timestamp, and optional
project boundary.

Workspace-wide events are visible to all active workspace members. Events linked
to workspace-access projects are also visible to all members. Events linked to a
restricted project are visible only to workspace owners, administrators, and users
with an explicit grant for that project. This applies to historical events as access
changes, preventing the feed from becoming a side channel for hidden projects.

The feed stores actor display names through the user relationship but does not
return actor email addresses. Deleted or deactivated actors may appear as a former
workspace member.

Workspace activity supports collaboration awareness, not compliance-grade audit.
Immutable finalized snapshots and decision history remain authoritative for the
decision record.

## Consequences

- Event producers must supply the relevant `project_id` when an entity inherits
  project visibility.
- Removing project access immediately removes the related event history from that
  user's feed; granting access reveals relevant historical events.
- Deleting a user preserves the event and clears its actor reference.
- Deleting a project also deletes its project-scoped events so a removed restricted
  project cannot become workspace-visible through a cleared project reference.
- Future activity types can reuse the same table without widening API schemas or
  bypassing established authorization rules.
