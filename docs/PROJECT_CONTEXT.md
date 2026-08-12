# DecisionFlow project context

Last verified against the working tree: 2026-08-10.

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
- Every account owns a personal workspace, has an explicit workspace membership,
  and points to an active workspace. Existing users and decisions are migrated
  into that boundary automatically.
- Owners and administrators can invite exact verified email addresses into the
  active workspace. Members can switch workspaces; owner, admin, and member roles
  collaborate on workspace decisions, while viewers have read-only access.
- Team workspace owners can explicitly transfer ownership to another active member;
  the previous owner becomes an administrator in the same transaction.
- Members can follow a workspace activity feed for important team, project-access,
  ownership, and decision lifecycle changes. Per-workspace unread counts power the
  header notification badge, unread filtering, and an explicit mark-all-read action.

### Decision workflow

- Create, list, retrieve, update, archive, and delete decisions.
- Search the access-authorized decision library across decision text, selected
  options, owner names, and project names. Filter by lifecycle status, project,
  decision owner, recorded outcome, and inclusive updated-date range; filter state
  is reflected in the URL for reusable library views.
- Use the frontend Projects workspace to create, rename, archive, and restore
  projects, review project-level decision counts, and open assigned decisions.
  New and existing decisions can be assigned to a project or kept unassigned,
  and the decision library can be filtered by project.
- Projects can be workspace-wide or restricted to selected workspace members.
  Restricted project decisions inherit the project visibility boundary, while
  workspace viewers remain read-only even when selected.
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
- Test recommendation robustness with deterministic weight sensitivity,
  scenario outcomes, source-specific coverage gates, and tipping-point analysis.
- Compare options, select an explicit final option, and finalize an immutable
  snapshot.
- Schedule an outcome review for a finalized decision with an expected outcome,
  measurable success signals, an accountable workspace member, assumptions, revisit triggers,
  and a review date. The Outcomes workspace separates due and upcoming reviews
  and highlights finalized decisions that still need a plan.
- Persist editable outcome-assessment drafts with an overall result, observed
  metric results, supporting evidence, assumption findings, lessons learned, and
  follow-up notes. Starting an assessment snapshots its metric and assumption
  baseline so later plan edits cannot silently change the evaluation target.
- Start or resume those drafts directly from each due or upcoming Outcomes card.
  The dashboard counts saved drafts, workspace editors can update the structured
  assessment form, and viewers can inspect the same evidence in read-only mode.
- Complete a ready assessment through an explicit irreversible action. Completion
  requires assessed metrics and assumptions with evidence, records the actor and
  time, creates a versioned snapshot, and moves the record into a read-only
  Completed reviews section. Repeated completion requests are safe retries.
- Use access-aware outcome portfolio intelligence to track review-plan coverage,
  assessment completion, follow-up rate, median review cycle time, observed-result
  distribution, and recent recorded lessons. These are deterministic aggregates of
  visible completed reviews, not an invented AI decision-quality score.
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
- Authenticated decision access is constrained to the user's active workspace.
  Owner, admin, and member roles can mutate workspace content; viewers are
  read-only. Restricted projects further constrain project and assigned-decision
  visibility to selected members; owners and administrators always retain access.
- Projects are workspace-owned. Archived projects retain their decisions but
  cannot receive new assignments until restored.
- Project assignment is organizational metadata outside the immutable finalized
  snapshot and can be changed without rewriting finalized decision content.
- Outcome-review plans are mutable follow-up records outside the finalized snapshot.
  They inherit decision and restricted-project access; editing a plan never mutates
  the finalized decision, and removing its workspace owner leaves it unassigned.
- Outcome assessments inherit the same decision and project access. Their metric
  and assumption baselines are fixed on first save. Draft results remain editable;
  completed assessments and their versioned completion snapshots are immutable.
- Public reports exclude sensitive source and reviewer information.
- Secure invitation and share tokens are opaque and revocable or expiring.
- Workspace invitation tokens are hashed, email-bound, expiring, and expose only
  a masked invited address in their public preview.
- Workspace activity is isolated to the active workspace. Events associated with
  restricted projects inherit that project's visibility boundary and expose actor
  display names without actor email addresses.
- Activity read state is per user and workspace. Own events do not count as unread,
  and membership removal clears that workspace's saved read position.
- Team ownership transfer is explicit and atomic, cannot target the current owner,
  and cannot be used for personal workspaces.
- AI evidence is accepted only when it can be matched to stored transcript
  content.
- AI-discovered options remain suggestions until the user explicitly accepts
  them into reviewed decision information.
- AI-discovered criteria remain suggestions until the user explicitly accepts
  them into reviewed decision information.
- Robustness simulations never replace saved weights, scores, or the recorded AI
  recommendation, and do not run on incomplete score matrices.
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
