from sqlalchemy.orm import Session

from app.models.decision import Decision
from app.models.decision_history import DecisionHistory
from app.models.recommendation import Recommendation


class RecommendationRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_decision(self, decision_id: str) -> list[Recommendation]:
        return (
            self.db.query(Recommendation)
            .filter(Recommendation.decision_id == decision_id)
            .order_by(Recommendation.created_at.desc())
            .all()
        )

    def create(
        self,
        decision: Decision,
        recommended_option: str,
        rationale: str,
        confidence_score: int,
        recommendation_payload: dict | None = None,
        ai_model: str | None = None,
        ai_usage: dict | None = None,
    ) -> Recommendation:
        recommendation = Recommendation(
            decision_id=decision.id,
            recommended_option=recommended_option,
            rationale=rationale,
            confidence_score=confidence_score,
            recommendation_payload=recommendation_payload,
            ai_model=ai_model,
            ai_usage=ai_usage,
        )
        decision.status = "in_recommendation"
        self.db.add(recommendation)
        self.db.add(DecisionHistory(decision_id=decision.id, action="in_recommendation", note=rationale))
        self.db.commit()
        self.db.refresh(recommendation)
        return recommendation
