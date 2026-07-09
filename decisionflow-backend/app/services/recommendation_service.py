from sqlalchemy.orm import Session

from app.core.responses import raise_error
from app.repositories.decision_repository import DecisionRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.services.ai_errors import AiServiceError
from app.services.ai_service import OpenRouterDecisionFlowService
from app.services.context_builder import ContextBuilder


class RecommendationService:
    def __init__(self, db: Session):
        self.decision_repository = DecisionRepository(db)
        self.recommendation_repository = RecommendationRepository(db)
        self.ai_service = OpenRouterDecisionFlowService()
        self.context_builder = ContextBuilder()

    def list_recommendations(self, decision_id: str, user_id: str):
        decision = self._get_owned_decision(decision_id, user_id)
        return self.recommendation_repository.list_for_decision(decision.id)

    def create_recommendation(self, decision_id: str, user_id: str, options: list[str]):
        decision = self._get_owned_decision(decision_id, user_id)
        context = self.context_builder.build_recommendation_context(decision, options)
        try:
            ai_result = self.ai_service.generate_recommendation(context)
        except AiServiceError as exc:
            raise_error(exc.status_code, exc.message, exc.details)

        recommendation = ai_result.data
        rationale = "\n".join(recommendation.reasoning) or recommendation.recommendation
        return self.recommendation_repository.create(
            decision=decision,
            recommended_option=recommendation.recommendation[:200] or "Review options",
            rationale=rationale,
            confidence_score=recommendation.confidence_score(),
            recommendation_payload=recommendation.model_dump(),
            ai_model=ai_result.model,
            ai_usage=ai_result.usage,
        )

    def _get_owned_decision(self, decision_id: str, user_id: str):
        decision = self.decision_repository.get_for_user(decision_id, user_id)
        if not decision:
            raise_error(404, "Decision not found")
        return decision
