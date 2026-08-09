# ADR 008: Track activity read state with a visible high-water mark

## Status

Accepted.

## Decision

DecisionFlow stores one activity read position per user and workspace. The position
is a timestamp through the newest event that was visible when the member explicitly
selected “Mark all read.” Unread counts and event markers include only newer events
created by another actor and apply the same workspace and restricted-project query
used by the activity feed.

When no read state exists, the first unread-count request establishes the current
time as a clean baseline. This prevents existing members from receiving a badge for
the entire activity history when the feature is deployed. A removed member's read
state is deleted so a later invitation starts a new membership baseline.

The notification bell links to the activity feed rather than maintaining a second
notification data model. Read state changes only presentation and does not mutate,
hide, or delete the underlying collaboration events.

## Consequences

- A user's own changes remain visible in activity but do not create notification
  noise for that user.
- Project access changes can alter the visible unread count immediately because
  authorization is evaluated when the count is requested.
- Marking all read cannot consume a concurrently created later event because the
  stored position comes from the newest event visible to that request.
- This model supports a single read/unread boundary. Per-event dismissal or custom
  notification preferences would require a separate design.
