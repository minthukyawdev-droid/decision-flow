from datetime import datetime

from pydantic import BaseModel, Field


class CriterionCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=1000)
    weight: int = Field(default=1, ge=1, le=10)


class CriterionResponse(BaseModel):
    id: str
    name: str
    description: str | None
    weight: int


class DecisionCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    criteria: list[CriterionCreateRequest] = Field(default_factory=list, max_length=20)


class DecisionUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    status: str | None = Field(
        default=None,
        pattern="^(draft|in_review|in_workspace|in_recommendation|in_compare|finalized|recommended|archived)$",
    )
    criteria: list[CriterionCreateRequest] | None = Field(default=None, max_length=20)


class DecisionResponse(BaseModel):
    id: str
    title: str
    description: str | None
    status: str
    criteria: list[CriterionResponse] = []
    created_at: datetime
    updated_at: datetime
