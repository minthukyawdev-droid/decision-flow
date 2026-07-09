# DecisionFlow Backend

FastAPI MVP backend for DecisionFlow. The backend uses OpenRouter for transcript extraction and recommendation generation, validates AI JSON with Pydantic, and stores validated AI outputs in the database.

## Tech Stack

- FastAPI
- Python
- SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic
- JWT authentication
- bcrypt password hashing
- Pytest

## Project Structure

```text
decisionflow-backend/
├── app/
│   ├── main.py
│   ├── core/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── db/
│   └── tests/
├── alembic/
├── requirements.txt
├── .env.example
└── README.md
```

## Local Setup

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` for your local PostgreSQL database:

```env
DATABASE_URL=postgresql+psycopg://decisionflow:decisionflow@localhost:5432/decisionflow
```

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Open the API docs:

- Swagger UI: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `APP_NAME` | FastAPI application name |
| `ENVIRONMENT` | Runtime environment label |
| `DATABASE_URL` | SQLAlchemy database URL |
| `JWT_SECRET_KEY` | Secret used to sign JWT access tokens |
| `JWT_ALGORITHM` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime |
| `FRONTEND_ORIGINS` | Comma-separated CORS origins |
| `MAX_TRANSCRIPT_UPLOAD_BYTES` | Maximum transcript upload size |
| `OPENROUTER_API_KEY` | OpenRouter API key used only by the backend |
| `OPENROUTER_BASE_URL` | OpenRouter OpenAI-compatible API URL |
| `OPENROUTER_MODEL` | OpenRouter model slug |
| `OPENROUTER_SITE_URL` | Optional app URL sent to OpenRouter for attribution |
| `OPENROUTER_APP_NAME` | Optional app name sent to OpenRouter for attribution |
| `AI_TEMPERATURE` | Model temperature, default `0.2` |
| `AI_TIMEOUT_SECONDS` | OpenRouter request timeout |
| `AI_MAX_RETRIES` | Retry count for transient OpenRouter failures |
| `MAX_AI_INPUT_CHARS` | Maximum pasted/uploaded text sent to AI |

## API Endpoints

Health:

- `GET /health`

Authentication:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

Decisions:

- `GET /api/v1/decisions`
- `POST /api/v1/decisions`
- `GET /api/v1/decisions/{decision_id}`
- `PATCH /api/v1/decisions/{decision_id}`
- `DELETE /api/v1/decisions/{decision_id}`

Transcripts:

- `GET /api/v1/decisions/{decision_id}/transcripts`
- `POST /api/v1/decisions/{decision_id}/transcripts/paste`
- `POST /api/v1/decisions/{decision_id}/transcripts/upload`
- `GET /api/v1/decisions/{decision_id}/transcripts/{transcript_id}/extracted`

Recommendations:

- `POST /api/v1/decisions/{decision_id}/recommendations`
- `GET /api/v1/decisions/{decision_id}/recommendations`

## Response Format

Successful responses use:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error responses use:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": []
}
```

## Transcript Upload Rules

- Accepted content types: `text/plain`, `text/markdown`
- Files must be UTF-8 text
- Default size limit: 5 MB

## AI Services

Prompt files live in `prompts/`:

- `system.md`
- `transcript_extraction.md`
- `recommendation.md`

All AI calls are made from backend services. API keys are never returned to the frontend. Transcript and pasted content are validated for size, emptiness, and unsupported control characters before calling OpenRouter. AI responses are parsed as JSON, validated with Pydantic, saved to PostgreSQL JSON columns, and exposed through the existing API response envelope.

OpenRouter supports the OpenAI-compatible API, so DecisionFlow uses the OpenAI SDK with OpenRouter's base URL.

```env
OPENROUTER_API_KEY=sk-or-your_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=~openai/gpt-latest
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=DecisionFlow
AI_TEMPERATURE=0.2
AI_TIMEOUT_SECONDS=30
AI_MAX_RETRIES=2
```

You can replace `OPENROUTER_MODEL` with any OpenRouter model slug, such as `openai/gpt-5.2`, `anthropic/claude-opus-4.1`, or `openrouter/free`. Keep in mind that DecisionFlow asks the model to return JSON, so choose a model/router that supports structured JSON responses.

If OpenRouter is not configured, the backend returns a conservative fallback response and records the fallback reason in `ai_usage`. Quota, invalid-key, invalid-model, and unavailable-service errors are returned clearly instead of being hidden by fallback behavior.

## Run Tests

Tests use an isolated in-memory SQLite database and do not require PostgreSQL:

```bash
pytest
```

## Assumptions

- The frontend will call the API from `http://localhost:3000` or `http://localhost:5173` by default.
- PostgreSQL is the runtime database, while SQLite is used only for automated tests.
