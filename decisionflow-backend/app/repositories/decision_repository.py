from sqlalchemy.orm import Session, selectinload

from app.models.criterion import Criterion
from app.models.decision import Decision
from app.models.decision_history import DecisionHistory


class DecisionRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_user(self, user_id: str) -> list[Decision]:
        return (
            self.db.query(Decision)
            .options(
                selectinload(Decision.criteria),
                selectinload(Decision.recommendations),
                selectinload(Decision.transcripts),
            )
            .filter(Decision.user_id == user_id)
            .order_by(Decision.created_at.desc())
            .all()
        )

    def get_for_user(self, decision_id: str, user_id: str) -> Decision | None:
        return (
            self.db.query(Decision)
            .options(
                selectinload(Decision.criteria),
                selectinload(Decision.recommendations),
                selectinload(Decision.transcripts),
            )
            .filter(Decision.id == decision_id, Decision.user_id == user_id)
            .first()
        )

    def create(
        self,
        user_id: str,
        title: str,
        description: str | None,
        criteria: list[dict],
    ) -> Decision:
        decision = Decision(user_id=user_id, title=title, description=description)
        decision.criteria = [Criterion(**criterion) for criterion in criteria]
        self.db.add(decision)
        self.db.flush()
        self.db.add(DecisionHistory(decision_id=decision.id, action="created", note="Decision created"))
        self.db.commit()
        self.db.refresh(decision)
        return decision

    def update(self, decision: Decision, updates: dict) -> Decision:
        for field_name, value in updates.items():
            if field_name == "criteria":
                decision.criteria = [Criterion(**criterion) for criterion in value]
                continue
            setattr(decision, field_name, value)
        self.db.add(DecisionHistory(decision_id=decision.id, action="updated", note="Decision updated"))
        self.db.commit()
        self.db.refresh(decision)
        return decision

    def delete(self, decision: Decision) -> None:
        self.db.delete(decision)
        self.db.commit()
