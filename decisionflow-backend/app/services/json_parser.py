import json

from app.services.ai_errors import AiServiceError


def parse_json_object(content: str) -> dict:
    if not content or not content.strip():
        raise AiServiceError("AI returned an empty response", details={"reason": "empty_response"})

    text = content.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise AiServiceError("AI response was not valid JSON", details={"reason": "invalid_json"})

    try:
        parsed = json.loads(text[start : end + 1])
    except json.JSONDecodeError as exc:
        raise AiServiceError(
            "AI response was not valid JSON",
            details={"reason": "invalid_json", "error": str(exc)},
        ) from exc

    if not isinstance(parsed, dict):
        raise AiServiceError("AI response must be a JSON object", details={"reason": "invalid_json_shape"})
    return parsed
