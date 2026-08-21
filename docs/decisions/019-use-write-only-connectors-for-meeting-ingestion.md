# Use write-only connectors for meeting ingestion

- Status: accepted
- Date: 2026-08-21

## Context

The Decision Inbox can already store meeting sources, detect grounded candidates, and
require human promotion. External meeting tools still need a production-safe way to send
content without borrowing a user's browser token. Provider webhooks retry deliveries, may
reuse identifiers, and can outlive the user who configured them. A connector secret must
not expose inbox data or allow workspace administration.

## Decision

Issue a separate high-entropy credential for each workspace meeting source. Allow only
workspace owners and administrators to create, route, rotate, or revoke connectors. Show
the raw token once and persist only its SHA-256 hash plus a short, non-secret prefix.
Authenticate a single write-only import endpoint with that token; it does not grant any
read endpoint or user identity.

Require every connector import to include a stable provider external ID. Enforce uniqueness
per connector and fingerprint the normalized payload. An exact retry returns the original
inbox item, while changed content under the same ID returns a conflict. Route future imports
through the connector's project boundary and reject imports while that project is archived.
Keep previously imported items after rotation or revocation.

## Alternatives considered

- Reuse a workspace member's bearer token. Rejected because user sessions are broader,
  expire differently, and grant permissions a webhook does not need.
- Store connector tokens so admins can reveal them later. Rejected because a database or
  admin-interface disclosure would expose every active ingestion credential.
- Treat duplicate deliveries as new meetings. Rejected because normal webhook retries would
  clutter review and could promote the same decision twice.
- Overwrite an item when the external ID matches. Rejected because a retry must not silently
  change grounded evidence, especially after review or promotion.
- Claim native provider integrations. Rejected until provider-specific OAuth, signatures,
  payload mapping, and lifecycle contracts are implemented and verified independently.

## Consequences

- Meeting tools and automation platforms can push content without interactive login.
- Credential compromise is contained to write-only intake and can be stopped immediately.
- Provider adapters must retain a stable external ID and handle `409` conflicts explicitly.
- Native OAuth integrations remain a future adapter layer over this ingestion contract.
