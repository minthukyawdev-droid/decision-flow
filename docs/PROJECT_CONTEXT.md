# DecisionFlow project context

Last verified against the working tree: 2026-08-02.

## Product

DecisionFlow is a decision-intelligence application. A user supplies meeting
notes or a transcript, reviews extracted decision information, weights
criteria, receives an AI-assisted recommendation, compares options, selects a
final option, and produces an auditable decision record.

## Source-of-truth map

| Area | Location | Role |
| --- | --- | --- |
| Active frontend | `decisionflow-web-app/` | Next.js application and browser API integration |
| Active backend | `decisionflow-backend/` | FastAPI API, data model, services, jobs, and deployment |
| Database migrations | `decisionflow-backend/alembic/versions/` | PostgreSQL schema history |
| Backend tests | `decisionflow-backend/app/tests/` | API and service regression coverage |
| AI prompts | `decisionflow-backend/prompts/` | Extraction and recommendation instructions |
| UI reference | `decisionflow-hifi-prototype/` | High-fidelity reference; not the active application |
| Older prototype | `high-fidelity-prototype/` | Vite reference implementation |
| Product baseline | `DECISIONFLOW_MVP_DEVELOPMENT_PHASE.md` | MVP planning baseline, not a live implementation ledger |

The root Next.js files (`app/`, `components/`, `lib/`, and root `package.json`)
are older prototype scaffolding. Do not implement production features there
unless the task explicitly changes that boundary.

## Runtime architecture

```text
Browser / Next.js
    |
    | JSON or multipart requests; bearer authentication
    v
FastAPI /api/v1
    |
    +-- SQLAlchemy + Alembic --> PostgreSQL
    +-- OpenAI-compatible client --> OpenRouter
    +-- Email adapter --> file, Resend, Cloudflare Email Service, or SMTP
    +-- Approval automation job --> reminders and overdue escalation
```

Local frontend state is used for the access token, in-progress draft recovery,
theme, and language. Durable decision data and workflow state are stored by the
backend.

## Implemented capability map

### Account access

- Registration is protected by Cloudflare Turnstile.
- Email verification is required before login and authenticated API use.
- Verification resend and registration attempts are rate limited.
- JWT bearer tokens authenticate API requests.

### Decision workflow

- Create, list, retrieve, update, archive, and delete decisions.
- Paste or upload UTF-8 text/Markdown transcripts.
- Extract structured decision information through the backend AI service.
- Review and persist topic, options, criteria, stakeholders, risks, and action
  items.
- Assess decision readiness before recommendation and surface blockers or
  completeness warnings.
- Discover candidate options when the source contains fewer than two explicit
  alternatives; suggestions require explicit user acceptance before becoming
  reviewed options.
- Discover candidate criteria when the source contains no explicit evaluation
  factors; suggestions require explicit user acceptance before becoming
  reviewed criteria. Reviewers can accept candidates individually or together,
  and retry extraction when neither explicit nor candidate criteria are found.
- Weight criteria and generate a recommendation.
- Store evidence-grounded AI criterion evaluations and separate human scores.
- Identify missing option–criterion evidence, prioritize gaps by decision weight,
  and generate a copyable evidence-collection checklist without fabricating AI
  scores.
- Compare options, select an explicit final option, and finalize an immutable
  snapshot.
- Resume durable work from the backend while retaining a local recovery draft.

### Reporting, sharing, and approval

- Generate an owner report and chronological audit timeline.
- Create and revoke opaque public share links.
- Serve sanitized public reports with `Cache-Control: no-store`.
- Request approval from verified users or invite an exact email address.
- Preserve the invitation URL while a reviewer switches from the wrong active
  account to the exact invited email.
- Approve or request changes; completed responses are immutable.
- Send reminders before deadlines and escalation notices after deadlines.

### Operations

- Frontend CI lints and builds the Next.js application.
- Backend CI runs the Pytest suite.
- The standard delivery path is: validate and document the feature or fix,
  commit only its scoped changes, push to GitHub, and let GitHub CI/CD deploy.
- Manual production deployment is a fallback, not the normal release path.
- Production backend assets target EC2, Docker Compose, Nginx, PostgreSQL,
  Alembic migrations, health/readiness checks, systemd automation, and backups.
- Frontend deployment is documented for Vercel.

## Key invariants

- Backend responses use the shared `{ success, message, data }` envelope; error
  responses may also include `details`.
- Provider keys and secrets never cross into frontend responses.
- Finalization requires an explicit selected option.
- Finalized content is immutable.
- Public reports exclude sensitive source and reviewer information.
- Secure invitation and share tokens are opaque and revocable or expiring.
- AI evidence is accepted only when it can be matched to stored transcript
  content.
- AI-discovered options remain suggestions until the user explicitly accepts
  them into reviewed decision information.
- AI-discovered criteria remain suggestions until the user explicitly accepts
  them into reviewed decision information.
- SQLite is for automated tests; PostgreSQL is the runtime database.

## Local development and verification

From the repository root, run `start-dev-servers.cmd` to start:

- API and Swagger UI at `http://localhost:8000/docs`
- Web application at `http://localhost:3000`

Focused verification:

```text
cd decisionflow-backend
pytest

cd decisionflow-web-app
npm run lint
npm run build
npm run check:api
```

Run the checks affected by the change. Cross-stack API changes normally require
backend tests plus the frontend API integration check.

## How to maintain this file

Update this document in the same change when a feature alters capabilities,
system boundaries, authoritative directories, data ownership, important
invariants, or verification commands. Replace stale statements instead of
adding chronological notes. Put detailed endpoint lists, configuration tables,
and operational procedures in the relevant component README.
