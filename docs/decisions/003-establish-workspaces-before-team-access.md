# Establish workspaces before team access

- Status: accepted
- Date: 2026-08-02

## Context

DecisionFlow needs to organize decisions into projects and later support multiple
people in one account boundary. Adding projects directly to user-owned decisions
would make future data isolation and permission changes risky. Exposing all decisions
to anyone with a workspace membership would also broaden access before roles and
project permissions exist.

## Decision

Every user receives a personal workspace and an owner membership. The user stores an
active workspace pointer, and every decision belongs to exactly one workspace while
retaining its existing owner. Existing users receive one personal workspace and all of
their decisions are assigned to it during migration.

For this foundation release, authenticated decision access requires both the existing
owner match and the active-workspace match. Workspace membership is therefore an
isolation boundary, not yet an authorization grant. Later team releases can introduce
explicit roles and project grants without changing the meaning of existing ownership.

## Alternatives considered

- Add projects directly under users. Rejected because projects would need another
  ownership migration when team workspaces are introduced.
- Treat every workspace member as an immediate collaborator. Rejected because it
  would expose existing decisions before role and project permissions are available.
- Store workspace selection only in the browser. Rejected because backend queries
  must enforce tenant isolation independently of client behavior.

## Consequences

Current screens, URLs, and owner-only behavior remain unchanged. New accounts and new
decisions receive their workspace atomically, while the migration backfills existing
records. The nullable active-workspace pointer supports safe account recovery, but the
application treats a missing active membership as an invalid internal state. Workspace
switching, team invitations, and shared access remain separate future features.
