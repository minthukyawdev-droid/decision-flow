import logging
import time
from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAI, RateLimitError
from pydantic import ValidationError

from app.core.config import get_settings
from app.schemas.ai import RecommendationGenerationResult, TranscriptExtractionResult
from app.services.ai_errors import AiServiceError
from app.services.json_parser import parse_json_object
from app.services.prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)
T = TypeVar("T")


class AiResult(Generic[T]):
    def __init__(self, data: T, model: str, usage: dict | None = None, fallback_used: bool = False):
        self.data = data
        self.model = model
        self.usage = usage or {}
        self.fallback_used = fallback_used


class AiService(ABC):
    @abstractmethod
    def extract_transcript(self, content: str) -> AiResult[TranscriptExtractionResult]:
        raise NotImplementedError

    @abstractmethod
    def generate_recommendation(self, context: dict) -> AiResult[RecommendationGenerationResult]:
        raise NotImplementedError


class OpenRouterDecisionFlowService(AiService):
    def __init__(self):
        self.settings = get_settings()
        self.prompt_builder = PromptBuilder()
        self.provider = "openrouter"
        self.model = self.settings.openrouter_model
        self.client = self._build_client()

    def extract_transcript(self, content: str) -> AiResult[TranscriptExtractionResult]:
        if not self.client:
            return self._fallback_extraction(content, reason="missing_api_key")

        prompt = self.prompt_builder.transcript_extraction_prompt(content)
        try:
            result, usage = self._request_json(prompt)
            validated = TranscriptExtractionResult.model_validate(result)
            self._log_usage("transcript_extraction", usage, False)
            return AiResult(validated, self.model, usage)
        except (AiServiceError, ValidationError) as exc:
            if isinstance(exc, AiServiceError) and not self._can_fallback(exc):
                raise
            logger.warning("AI transcript extraction failed after retries: %s", exc)
            return self._fallback_extraction(content, reason=type(exc).__name__)

    def generate_recommendation(self, context: dict) -> AiResult[RecommendationGenerationResult]:
        if not self.client:
            return self._fallback_recommendation(context, reason="missing_api_key")

        prompt = self.prompt_builder.recommendation_prompt(context)
        try:
            result, usage = self._request_json(prompt)
            validated = RecommendationGenerationResult.model_validate(result)
            self._log_usage("recommendation_generation", usage, False)
            return AiResult(validated, self.model, usage)
        except (AiServiceError, ValidationError) as exc:
            if isinstance(exc, AiServiceError) and not self._can_fallback(exc):
                raise
            logger.warning("AI recommendation generation failed after retries: %s", exc)
            return self._fallback_recommendation(context, reason=type(exc).__name__)

    def _build_client(self) -> OpenAI | None:
        if not self.settings.openrouter_api_key:
            return None
        default_headers = {}
        if self.settings.openrouter_site_url:
            default_headers["HTTP-Referer"] = self.settings.openrouter_site_url
        if self.settings.openrouter_app_name:
            default_headers["X-OpenRouter-Title"] = self.settings.openrouter_app_name
        return OpenAI(
            api_key=self.settings.openrouter_api_key,
            base_url=self.settings.openrouter_base_url,
            timeout=self.settings.ai_timeout_seconds,
            default_headers=default_headers or None,
        )

    def _request_json(self, user_prompt: str) -> tuple[dict, dict]:
        last_error: Exception | None = None
        attempts = self.settings.ai_max_retries + 1

        for attempt in range(attempts):
            try:
                request = {
                    "model": self.model,
                    "temperature": self.settings.ai_temperature,
                    "messages": [
                        {"role": "system", "content": self.prompt_builder.system_prompt()},
                        {"role": "user", "content": user_prompt},
                    ],
                    "response_format": {"type": "json_object"},
                }

                response = self.client.chat.completions.create(
                    **request,
                )
                message = response.choices[0].message.content if response.choices else ""
                usage = self._usage_dict(response)
                return parse_json_object(message or ""), usage
            except RateLimitError as exc:
                if self._error_code(exc) == "insufficient_quota":
                    raise AiServiceError(
                        "OpenRouter quota is exhausted. Check credits or limits before generating AI output.",
                        status_code=402,
                        details={"reason": "insufficient_quota"},
                    ) from exc
                last_error = exc
                time.sleep(min(2**attempt, 8))
            except APITimeoutError as exc:
                last_error = exc
                time.sleep(min(2**attempt, 8))
            except APIConnectionError as exc:
                last_error = exc
                time.sleep(min(2**attempt, 8))
            except APIStatusError as exc:
                last_error = exc
                if exc.status_code == 401:
                    raise AiServiceError(
                        f"{self.provider.title()} API key was rejected. Create a new key and update the backend .env file.",
                        status_code=401,
                        details={"reason": "invalid_api_key"},
                    ) from exc
                if exc.status_code == 404:
                    raise AiServiceError(
                        f"Configured {self.provider.title()} model is not available for this API key or project.",
                        status_code=400,
                        details={"reason": "invalid_model", "model": self.model, "provider": self.provider},
                    ) from exc
                if exc.status_code in {400, 413}:
                    raise AiServiceError(
                        "AI request was too large or invalid",
                        status_code=413,
                        details={"reason": "token_limit_or_bad_request"},
                    ) from exc
                if exc.status_code < 500:
                    break
                time.sleep(min(2**attempt, 8))

        raise AiServiceError(
            "AI service is temporarily unavailable",
            status_code=503,
            details={"reason": "ai_provider_unavailable", "provider": self.provider, "error": str(last_error) if last_error else None},
        )

    def _error_code(self, exc: Exception) -> str | None:
        body = getattr(exc, "body", None)
        if isinstance(body, dict):
            return body.get("code") or body.get("error", {}).get("code")
        return None

    def _can_fallback(self, exc: AiServiceError) -> bool:
        if self.provider == "openrouter" and exc.details.get("reason") == "ai_provider_unavailable":
            return False
        return exc.details.get("reason") not in {"missing_api_key", "insufficient_quota", "invalid_api_key", "invalid_model"}

    def _usage_dict(self, response) -> dict:
        usage = getattr(response, "usage", None)
        if not usage:
            return {}
        return {
            "prompt_tokens": getattr(usage, "prompt_tokens", None),
            "completion_tokens": getattr(usage, "completion_tokens", None),
            "total_tokens": getattr(usage, "total_tokens", None),
        }

    def _fallback_extraction(self, content: str, reason: str) -> AiResult[TranscriptExtractionResult]:
        normalized = " ".join(content.split())
        words = normalized.split()
        topic = " ".join(words[:24]) if words else ""
        option_words = self._find_marked_items(normalized, ["option", "alternative", "choice"])
        criteria_words = self._find_marked_items(normalized, ["criterion", "criteria", "factor"])
        data = TranscriptExtractionResult(
            decision_topic=topic,
            options=option_words,
            criteria=criteria_words,
            risks=self._find_marked_items(normalized, ["risk", "concern", "blocker"]),
            action_items=self._find_marked_items(normalized, ["action", "next step", "todo"]),
        )
        usage = {"fallback_reason": reason}
        self._log_usage("transcript_extraction", usage, True)
        return AiResult(data, self.model or "fallback", usage, fallback_used=True)

    def _fallback_recommendation(self, context: dict, reason: str) -> AiResult[RecommendationGenerationResult]:
        options = [option for option in context.get("options", []) if str(option).strip()]
        recommendation = str(options[0]) if options else context.get("decision", {}).get("title", "Continue review")
        criteria = context.get("criteria", [])
        data = RecommendationGenerationResult(
            recommendation=recommendation,
            confidence=0.65 if options else 0.35,
            reasoning=[
                "AI service was unavailable, so DecisionFlow generated a conservative fallback from the provided options and criteria.",
                f"Captured {len(options)} option(s) and {len(criteria)} criterion/criteria for human review.",
            ],
            risks=["Review this fallback carefully before finalizing the decision."],
            alternatives=[str(option) for option in options[1:4]],
            next_steps=["Regenerate the recommendation when the AI service is available.", "Validate the option against the highest-priority criteria."],
        )
        usage = {"fallback_reason": reason}
        self._log_usage("recommendation_generation", usage, True)
        return AiResult(data, self.model or "fallback", usage, fallback_used=True)

    def _find_marked_items(self, content: str, markers: list[str]) -> list[str]:
        lowered = content.lower()
        matches: list[str] = []
        for marker in markers:
            if marker in lowered:
                matches.append(marker.title())
        return matches[:5]

    def _log_usage(self, operation: str, usage: dict, fallback_used: bool) -> None:
        logger.info(
            "ai_usage operation=%s model=%s fallback=%s prompt_tokens=%s completion_tokens=%s total_tokens=%s",
            operation,
            self.model,
            fallback_used,
            usage.get("prompt_tokens"),
            usage.get("completion_tokens"),
            usage.get("total_tokens"),
        )
