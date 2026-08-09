# Keep project assignment outside finalized snapshots

- Status: accepted
- Date: 2026-08-09

## Context

Projects organize related decisions, including decisions finalized before projects
existed. If project assignment were treated as finalized decision content, users could
not organize legacy or completed records without violating immutability. If project
archival removed assignments, historical project context would be lost.

## Decision

Projects belong to exactly one workspace. A decision may reference one project in the
same workspace or remain unassigned. Project assignment is organizational metadata and
is not copied into the immutable finalized snapshot. Assignment changes are recorded in
the decision audit history but do not rewrite the snapshot.

Archiving a project is reversible and retains all existing decision assignments. An
archived project cannot receive new assignments until restored. Cross-workspace project
lookups and assignments return not found so the API does not reveal tenant data.

## Alternatives considered

- Require every decision to belong to a project. Rejected because existing decisions
  need a safe backward-compatible unassigned state.
- Freeze project assignment at finalization. Rejected because completed and legacy
  decisions still need organizational maintenance.
- Unassign decisions when a project is archived. Rejected because this destroys useful
  historical organization and makes restoration ambiguous.
- Delete projects permanently. Rejected because project history and decision grouping
  are durable business records.

## Consequences

Users can reorganize finalized decisions without changing the approved record. Project
archival is non-destructive, and the application must show archived project context for
already assigned decisions. Future project-level permissions can build on the workspace
boundary without migrating project ownership again.
