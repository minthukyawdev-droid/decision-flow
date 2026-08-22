# Poll Fathom OAuth connections with persisted cursors

- Status: accepted
- Date: 2026-08-22

## Context

Connected workspaces need new Fathom meetings to reach Decision Inbox without repeated manual
backfills. Fathom documents meeting and recording-transcript access for OAuth applications, while
its webhook-creation API reference presents API-key authorization. Depending on an uncertain
OAuth webhook-registration capability would make a customer-facing automatic-ingestion promise
fragile. Repeatedly scanning only the newest page could also strand older meetings after downtime.

## Decision

Make automatic import an explicit per-connection opt-in, separate from automatic AI detection.
Run a production systemd timer every five minutes. Each invocation selects a bounded batch of
active opted-in connections, ordered by their oldest automatic attempt, so a large account set is
processed fairly.

For each connection, request one Fathom meeting page through its encrypted OAuth authorization,
persist the opaque next cursor, and resume from that cursor on the next cycle. Reset the cursor at
the end of pagination so newly available meetings and transcripts are revisited. Feed every page
through the provider-bound recording-ID uniqueness and grounded transcript import path. Persist
attempt time, consecutive failure count, and only sanitized errors. Isolate one connection's
failure from the rest of the worker batch; authorization failure moves that connection to the
existing reconnect-required state.

## Alternatives considered

- Register a Fathom webhook for every OAuth connection. Deferred because the webhook API reference
  currently documents API-key authorization, whereas the app's multi-customer boundary is OAuth.
- Scan only the first page every cycle. Rejected because a backlog larger than one page could
  permanently hide older meetings.
- Enable automatic import immediately after OAuth. Rejected because importing private meeting
  content continuously should require a clear workspace-admin opt-in.
- Combine automatic import and automatic AI detection. Rejected because teams may want reliable
  collection with human-triggered analysis, or manual collection with automatic analysis.

## Consequences

- Automatic ingestion has up to roughly five minutes of scheduling latency plus provider
  processing time.
- Cursor persistence supports bounded, rate-conscious catch-up after downtime without exposing
  cursor or OAuth values to the browser.
- Existing imported meetings survive disabling automatic import or disconnecting the provider.
- A future signed-webhook implementation can replace the polling trigger without changing inbox
  lineage, idempotency, grounding, or human review.
