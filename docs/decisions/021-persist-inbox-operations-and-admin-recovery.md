# Persist inbox operations and administrator recovery

- Status: accepted
- Date: 2026-08-22

## Context

Persisted retries make connected meeting detection durable, but administrators still cannot
distinguish an empty queue from a stopped worker or recover exhausted items without database
access. Logging raw provider failures or meeting data into shared notifications would create
an unnecessary privacy boundary.

## Decision

Persist a singleton heartbeat for each Decision Inbox worker tick with start time, completion
time, and aggregate counts. Derive worker health from that record rather than from process-local
state. Store consecutive detection health on each connector, reset it on success, and create a
single recipient-only alert for workspace owners and administrators after three consecutive
failures. Alerts contain connector metadata and an inbox route only.

Expose an administrator-only operations API and UI containing the heartbeat, connector health,
and terminal automatic-detection failures. The failure representation omits meeting content,
participants, source URLs, and credentials. Requeue requests lock and validate every selected
item in one transaction, reset persisted attempts, and return work to the existing queue.

## Alternatives considered

- Treat application logs as the operations interface. Rejected because product administrators
  should not need EC2 access and logs are a poor recovery workflow.
- Send every failed attempt to the workspace activity feed. Rejected because transient retries
  are expected and repeated alerts would create noise.
- Automatically retry forever. Rejected because invalid output and persistent provider faults
  need bounded cost and an explicit human recovery decision.
- Copy provider errors and meeting titles into alerts. Rejected because operational signals do
  not need private meeting evidence.

## Consequences

- Administrators can see queue liveness and recover exhausted work without infrastructure access.
- Repeated provider problems create a durable but non-spamming signal.
- Heartbeat freshness depends on the configured worker cadence and lease threshold.
- Native provider OAuth and provider-specific sync health remain separate future capabilities.
