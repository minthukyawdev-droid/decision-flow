from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    decision_id: Mapped[str] = mapped_column(String(36), ForeignKey("decisions.id"), index=True, nullable=False)
    recommended_option: Mapped[str] = mapped_column(String(200), nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[int] = mapped_column(Integer, nullable=False)
    recommendation_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ai_model: Mapped[str | None] = mapped_column(String(120), nullable=True)
    ai_usage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    decision = relationship("Decision", back_populates="recommendations")
