# Persist automatic inbox detection before AI calls

- Status: accepted
- Date: 2026-08-22

## Context

Write-only connectors can reliably ingest meetings, but requiring a person to open every
item and click Detect prevents the Decision Inbox from operating as a connected workflow.
Calling AI inline from the public import request would make provider latency and outages part
of the webhook contract. A process can also stop after accepting an import or while an AI
request is running, so in-memory retries are not sufficient.

## Decision

Queue automatic detection in persisted inbox-item state before acknowledging a connected
import. Capture the configuring administrator's selected AI model on the connector and enable
automatic detection by default, while allowing administrators to choose manual processing for
future imports.

Run a dedicated EC2 systemd timer every minute. Each tick selects due items in a bounded batch,
claims one with a PostgreSQL row lock, persists its attempt and lease timestamp, then releases
the lock before the AI call. A later tick may reclaim a stale processing lease. Successful
detection retains the existing exact-source-span grounding and human promotion gate.

Retry only timeouts, throttling, and provider/server failures with persisted exponential
backoff and a bounded attempt count. Treat invalid input and exhausted retries as terminal and
show queue status, attempts, failure details, and the next retry time to authorized users.

## Alternatives considered

- Detect inline in the connector import request. Rejected because provider latency and outages
  would trigger webhook retries even after DecisionFlow had accepted the source.
- Keep retry state only in the timer process. Rejected because restarts and deployments would
  lose work and make recovery ambiguous.
- Add a separate queue service immediately. Deferred because PostgreSQL already provides the
  durable state and locking needed at the current scale; the persisted state can later feed a
  dedicated queue without changing the ingestion contract.
- Retry every failure. Rejected because invalid content and policy conflicts will not improve
  with repetition and would waste provider capacity.

## Consequences

- Connected meetings progress without a manual Detect click and imports remain fast.
- Temporary AI outages are visible and self-healing instead of silently terminal.
- The database and minute-level worker are part of the detection reliability boundary.
- Throughput is intentionally bounded; a dedicated queue can replace the timer if volume or
  latency requirements outgrow this design.
