from sqlalchemy.orm import Session

from app.core.responses import raise_error
from app.models.decision import Decision
from app.repositories.decision_repository import DecisionRepository
from app.schemas.decision import DecisionCreateRequest, DecisionUpdateRequest


class DecisionService:
    def __init__(self, db: Session):
        self.decision_repository = DecisionRepository(db)

    def list_decisions(self, user_id: str) -> list[Decision]:
        return self.decision_repository.list_for_user(user_id)

    def get_decision(self, decision_id: str, user_id: str) -> Decision:
        decision = self.decision_repository.get_for_user(decision_id, user_id)
        if not decision:
            raise_error(404, "Decision not found")
        return decision

    def create_decision(self, user_id: str, payload: DecisionCreateRequest) -> Decision:
        return self.decision_repository.create(
            user_id=user_id,
            title=payload.title,
            description=payload.description,
            criteria=[criterion.model_dump() for criterion in payload.criteria],
        )

    def update_decision(self, decision_id: str, user_id: str, payload: DecisionUpdateRequest) -> Decision:
        decision = self.get_decision(decision_id, user_id)
        updates = payload.model_dump(exclude_unset=True)
        if not updates:
            raise_error(400, "No update fields provided")
        if decision.status in {"finalized", "recommended"} and updates.get("status") not in {None, "finalized", "recommended", "archived"}:
            raise_error(409, "Finalized decisions cannot return to an earlier workflow step")
        return self.decision_repository.update(decision, updates)

    def delete_decision(self, decision_id: str, user_id: str) -> None:
        decision = self.get_decision(decision_id, user_id)
        self.decision_repository.delete(decision)
