from datetime import datetime

from pydantic import BaseModel, Field


class TranscriptPasteRequest(BaseModel):
    content: str = Field(min_length=1, max_length=100_000)


class ExtractedInformationResponse(BaseModel):
    summary: str
    decision_topic: str = ""
    options: list[str]
    criteria: list[str]
    stakeholders: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)


class TranscriptResponse(BaseModel):
    id: str
    source_type: str
    file_name: str | None
    content: str
    extracted_information: ExtractedInformationResponse | None
    created_at: datetime
