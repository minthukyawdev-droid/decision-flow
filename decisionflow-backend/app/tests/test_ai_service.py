import pytest

from app.core.config import get_settings
from app.services.ai_service import OpenRouterDecisionFlowService


@pytest.fixture(autouse=True)
def clear_settings_cache():
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_openrouter_provider_uses_openrouter_settings(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-openrouter-key")
    monkeypatch.setenv("OPENROUTER_MODEL", "openai/gpt-5.2")
    monkeypatch.setenv("OPENROUTER_SITE_URL", "https://decisionflow.local")
    monkeypatch.setenv("OPENROUTER_APP_NAME", "DecisionFlow Test")

    service = OpenRouterDecisionFlowService()

    assert service.model == "openai/gpt-5.2"
    assert service.client is not None


def test_openrouter_provider_falls_back_without_api_key(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "")

    service = OpenRouterDecisionFlowService()

    result = service.extract_transcript("Option A is cheaper.")

    assert result.fallback_used is True
    assert result.usage == {"fallback_reason": "missing_api_key"}
