# Isolate and encrypt native provider credentials

- Status: accepted
- Date: 2026-08-22

## Context

Generic Decision Inbox connectors authenticate third-party writes with one-way token hashes.
A native Fathom integration must instead call the provider on a user's behalf, so DecisionFlow
must recover OAuth access and refresh tokens. Hashing cannot support that use case, while placing
recoverable secrets on the connection record increases the chance of accidental serialization.

## Decision

Represent native provider accounts separately from generic write-only connectors. Store account,
workspace, project-routing, and lifecycle metadata in `meeting_provider_connections`, while a
one-to-one `meeting_provider_credentials` table contains only encrypted OAuth tokens and expiry
metadata.

Encrypt every token with Fernet before persistence. Configure a comma-separated backend key ring
with the newest key first: new writes use the first key and reads accept every configured key.
Prefix ciphertext with a format version so a future encryption migration can fail closed. API
serializers may reveal only whether credentials are configured, never plaintext or ciphertext.
Disconnecting a provider account deletes its credential row while retaining sanitized connection
history.

## Alternatives considered

- Reuse hashed generic connector tokens. Rejected because outbound provider API calls require a
  recoverable OAuth credential and generic tokens authorize only inbound writes.
- Put encrypted token columns directly on the connection. Rejected because routine connection
  queries and serializers would handle secrets unnecessarily.
- Derive encryption from the JWT signing key. Rejected because rotating login signing material
  must not make provider credentials unreadable and the two secrets have different lifecycles.
- Store provider tokens in plaintext in the protected database. Rejected because database access
  or backups would immediately reveal durable third-party authorization.

## Consequences

- Connection metadata can be listed and audited without loading credential ciphertext.
- Key rotation can occur without downtime by prepending a new key and retaining old keys during
  re-encryption.
- Production must preserve `PROVIDER_CREDENTIAL_ENCRYPTION_KEYS`; losing every old key makes the
  corresponding provider credentials unrecoverable and requires reconnection.
- OAuth activation and provider-specific synchronization build on this boundary in later parts.
