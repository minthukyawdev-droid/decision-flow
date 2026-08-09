# Authorize team access with workspace roles

- Status: accepted
- Date: 2026-08-09

## Context

Workspace membership was introduced first as an isolation boundary while decision
access remained owner-only. Team collaboration now needs a controlled way to invite
people, switch workspace context, and share project and decision access without
making every invited user an administrator.

## Decision

Workspace invitations are single-purpose, exact-email tokens stored only as SHA-256
hashes. Public invitation previews mask the email address, responses are not cached,
and acceptance requires a verified account with the invited address. Invitations
expire and can be revoked before acceptance.

Workspace roles authorize the active workspace as follows:

- Owner: full content and team administration access.
- Admin: content access and team administration, except granting or managing admins.
- Member: create and edit projects and decisions.
- Viewer: read-only access to workspace projects and decisions.

The owner cannot be demoted or removed. Accepted users retain their personal
workspace and explicitly switch the active workspace. Decision ownership remains
recorded for attribution, but all members can read decisions in the active workspace;
non-viewer roles can update them subject to the existing finalization rules.

## Alternatives considered

- Keep decisions owner-only after invitation. Rejected because membership would not
  provide useful collaboration.
- Give every member full administrative rights. Rejected because routine contributors
  should not control access or administrator roles.
- Put project grants into the same release. Rejected because workspace roles provide
  a coherent first authorization layer and project grants require separate policy and
  migration decisions.
- Automatically replace the invitee's active workspace on acceptance. Rejected because
  accepting an invitation should not silently move the user's working context.

## Consequences

Team members can collaborate across every project and decision in the active workspace.
Viewer mutation attempts are rejected by the API even if a stale client exposes an edit
control. Workspace switching is explicit and tenant queries remain enforced by the
backend. Ownership transfer, self-service workspace leaving, and project-specific
permissions remain future features.
