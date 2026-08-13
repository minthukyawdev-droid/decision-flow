# ADR 014: Use recipient-scoped activity for exact mentions

## Status

Accepted.

## Context

Free-text `@name` parsing is ambiguous when names repeat and cannot prove that the named
person may open a restricted decision. Broadcasting mention metadata through the workspace
activity feed would also disclose who was selected to unrelated members.

## Decision

Store comment mentions as an ordered list of verified user IDs. Publish candidates from a
decision-scoped endpoint that includes only active workspace members who can currently access
that decision, excludes the author, and returns display names and roles without email
addresses. Revalidate every ID when the comment is created and reject the whole write if any
candidate is stale or unauthorized.

Represent each mention notification as a workspace activity event with one optional
`recipient_user_id`. Recipient-scoped events pass the normal workspace and project-access
checks and are then visible only to that user, including when the requester is an owner or
administrator. Store only the comment ID and linked-field reference in notification metadata;
never copy comment text. Deleting the recipient account deletes its targeted events.

## Alternatives considered

- Parse typed `@names`. Rejected because names are neither unique nor authorization evidence.
- Broadcast mention events and hide them only in the UI. Rejected because the API would still
  leak recipient information.
- Add a separate notifications table. Rejected for now because mention delivery uses the
  existing activity feed, unread high-water mark, and project visibility rules without needing
  per-notification dismissal or channel preferences.

## Consequences

Mentions are deterministic, access-aware, and appear in the existing notification experience.
Candidate access changes between page load and submission are safe because the backend checks
again. A mentioned person may see both the general comment activity and the targeted mention
activity for the same post; the targeted event supplies the explicit notification signal.
