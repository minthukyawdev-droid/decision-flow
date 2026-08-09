# ADR 006: Restrict project access and transfer team ownership explicitly

## Status

Accepted.

## Decision

Projects support `workspace` and `restricted` access modes. Workspace access is
the compatibility default. Restricted projects store explicit grants for selected
workspace users. Workspace owners and administrators bypass project grants so the
organization cannot create an unmanageable project.

Decisions assigned to a restricted project inherit the project's visibility. An
unassigned decision remains workspace-visible. Workspace roles continue to define
mutation authority: selected members can collaborate, while selected viewers remain
read-only. Removing a workspace member deletes their project grants.

Only workspace owners and administrators manage restricted-project membership.
This keeps membership changes auditable and prevents project collaborators from
expanding their own access boundary.

Team workspace ownership transfer is a separate owner-only operation. It requires
an active target membership and exact confirmation of the workspace name. The
target becomes owner and the previous owner becomes administrator in one database
transaction. Personal workspace ownership is not transferable.

## Consequences

- Existing projects remain workspace-wide without a backfill of grants.
- Project and assigned-decision queries must apply the same access predicate.
- Owners and administrators retain recovery access to every project.
- Restricted access is intentionally workspace-scoped; external guests still need
  a workspace membership.
- Ownership transfer does not rewrite projects, decisions, or finalized snapshots.
