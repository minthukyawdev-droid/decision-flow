from pydantic import BaseModel, Field, field_validator


def _clean_items(items: list[str]) -> list[str]:
    cleaned: list[str] = []
    for item in items:
        value = " ".join(str(item).split())
        if value:
            cleaned.append(value[:500])
    return cleaned[:20]


class TranscriptExtractionResult(BaseModel):
    decision_topic: str = Field(default="", max_length=500)
    options: list[str] = Field(default_factory=list)
    criteria: list[str] = Field(default_factory=list)
    stakeholders: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)

    @field_validator("decision_topic")
    @classmethod
    def clean_topic(cls, value: str) -> str:
        return " ".join(value.split())[:500]

    @field_validator("options", "criteria", "stakeholders", "risks", "action_items")
    @classmethod
    def clean_lists(cls, value: list[str]) -> list[str]:
        return _clean_items(value)

    def legacy_summary(self) -> str:
        return self.decision_topic


class RecommendationGenerationResult(BaseModel):
    recommendation: str = Field(default="", max_length=1000)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    reasoning: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)

    @field_validator("recommendation")
    @classmethod
    def clean_recommendation(cls, value: str) -> str:
        return " ".join(value.split())[:1000]

    @field_validator("reasoning", "risks", "alternatives", "next_steps")
    @classmethod
    def clean_lists(cls, value: list[str]) -> list[str]:
        return _clean_items(value)

    def confidence_score(self) -> int:
        return round(self.confidence * 100)
