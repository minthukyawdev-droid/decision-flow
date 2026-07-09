from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Transcript(Base):
    __tablename__ = "transcripts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    decision_id: Mapped[str] = mapped_column(String(36), ForeignKey("decisions.id"), index=True, nullable=False)
    source_type: Mapped[str] = mapped_column(String(40), nullable=False)
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_options: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ai_model: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ai_usage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    decision = relationship("Decision", back_populates="transcripts")
