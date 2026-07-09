from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.api.serializers import serialize_recommendation
from app.core.responses import success_response
from app.db.session import get_db
from app.models.user import User
from app.schemas.recommendation import RecommendationCreateRequest
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/decisions/{decision_id}/recommendations", tags=["Recommendations"])


@router.get("")
def list_recommendations(
    decision_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recommendations = RecommendationService(db).list_recommendations(decision_id, current_user.id)
    return success_response(
        [serialize_recommendation(recommendation) for recommendation in recommendations],
        "Recommendation history retrieved",
    )


@router.post("", status_code=201)
def create_recommendation(
    decision_id: str,
    payload: RecommendationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recommendation = RecommendationService(db).create_recommendation(
        decision_id=decision_id,
        user_id=current_user.id,
        options=payload.options,
    )
    return success_response(serialize_recommendation(recommendation), "Recommendation created", 201)
