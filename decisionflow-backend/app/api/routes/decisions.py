from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.api.serializers import serialize_decision
from app.core.responses import success_response
from app.db.session import get_db
from app.models.user import User
from app.schemas.decision import DecisionCreateRequest, DecisionUpdateRequest
from app.services.decision_service import DecisionService

router = APIRouter(prefix="/decisions", tags=["Decisions"])


@router.get("")
def list_decisions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    decisions = DecisionService(db).list_decisions(current_user.id)
    return success_response([serialize_decision(decision) for decision in decisions], "Decisions retrieved")


@router.post("", status_code=201)
def create_decision(
    payload: DecisionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    decision = DecisionService(db).create_decision(current_user.id, payload)
    return success_response(serialize_decision(decision), "Decision created", 201)


@router.get("/{decision_id}")
def get_decision(
    decision_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    decision = DecisionService(db).get_decision(decision_id, current_user.id)
    return success_response(serialize_decision(decision), "Decision retrieved")


@router.patch("/{decision_id}")
def update_decision(
    decision_id: str,
    payload: DecisionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    decision = DecisionService(db).update_decision(decision_id, current_user.id, payload)
    return success_response(serialize_decision(decision), "Decision updated")


@router.put("/{decision_id}")
def replace_decision(
    decision_id: str,
    payload: DecisionUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    decision = DecisionService(db).update_decision(decision_id, current_user.id, payload)
    return success_response(serialize_decision(decision), "Decision updated")


@router.delete("/{decision_id}")
def delete_decision(
    decision_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    DecisionService(db).delete_decision(decision_id, current_user.id)
    return success_response(None, "Decision deleted")
