from datetime import datetime

from pydantic import BaseModel, Field


class RecommendationCreateRequest(BaseModel):
    options: list[str] = Field(default_factory=list, max_length=20)


class RecommendationResponse(BaseModel):
    id: str
    recommended_option: str
    rationale: str
    confidence_score: int = Field(ge=0, le=100)
    recommendation: str = ""
    confidence: float = Field(default=0.0, ge=0, le=1)
    reasoning: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    created_at: datetime
