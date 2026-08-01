# Architectural decisions

Add an architectural decision record when a change makes a durable choice with
meaningful alternatives or long-term consequences.

Use the next available numeric prefix and a short kebab-case name, for example
`001-store-finalized-snapshots.md`.

Each record should contain:

```markdown
# Decision title

- Status: proposed | accepted | superseded
- Date: YYYY-MM-DD

## Context

What problem or constraint requires a decision?

## Decision

What was chosen?

## Alternatives considered

What realistic alternatives were rejected, and why?

## Consequences

What becomes easier, harder, constrained, or required?
```

Keep implementation details in code and component documentation. ADRs explain
why a durable choice exists.

