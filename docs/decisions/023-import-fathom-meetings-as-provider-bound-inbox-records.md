# Import Fathom meetings as provider-bound inbox records

- Status: accepted
- Date: 2026-08-22

## Context

An authorized Fathom account must contribute meeting evidence without weakening Decision Inbox
project access, grounded AI detection, or import idempotency. OAuth applications cannot request
transcripts inline with the meeting list, and refresh tokens rotate when used. Treating native
imports as generic connector writes would conflate recoverable provider authorization with
one-way inbound credentials.

## Decision

Link native imports directly to `meeting_provider_connections` through a nullable provider
connection foreign key. Identify each import by the provider connection and stable Fathom
recording ID, enforced with a database uniqueness constraint. Keep generic connector lineage
separate.

Limit each administrator-triggered backfill to 10 recent accessible meetings. List meetings,
skip known recording IDs before additional provider calls, then retrieve each remaining
recording transcript through Fathom's transcript endpoint. Preserve speaker, timestamp, and
spoken text in the private inbox record so later AI evidence can cite exact stored spans. Skip
records without usable transcripts rather than inventing content.

Inherit the provider connection's current project route and automatic-detection preference when
creating the inbox item. Refresh expired access tokens only on the backend and persist both the
new access token and rotated refresh token through the encrypted credential vault before reuse.

## Alternatives considered

- Reuse a generic Decision Inbox connector. Rejected because native OAuth authorization and
  outbound API calls have different security and lifecycle semantics from write-only imports.
- Store transcripts on the provider connection. Rejected because meetings require independent
  access control, review state, detection retries, and promotion lineage.
- Request all meeting history in one operation. Rejected because it creates unpredictable
  provider load and long request times without a pagination and progress workflow.
- Create placeholder inbox items when no transcript exists. Rejected because downstream AI
  evidence must remain grounded in stored source text.

## Consequences

- Repeated manual syncs do not duplicate meetings and avoid repeat transcript calls for existing
  recordings.
- Provider imports participate in the same private review, automatic detection, and operations
  recovery workflows as connector imports.
- Disconnecting Fathom removes credentials but preserves imported meeting history; deleting the
  connection reference uses `SET NULL` semantics.
- The manual sync is intentionally bounded and does not replace a future incremental webhook or
  scheduled pagination workflow.
