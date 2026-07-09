from sqlalchemy.orm import Session

from app.models.transcript import Transcript


class TranscriptRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_decision(self, decision_id: str) -> list[Transcript]:
        return (
            self.db.query(Transcript)
            .filter(Transcript.decision_id == decision_id)
            .order_by(Transcript.created_at.desc())
            .all()
        )

    def get_for_decision(self, transcript_id: str, decision_id: str) -> Transcript | None:
        return (
            self.db.query(Transcript)
            .filter(Transcript.id == transcript_id, Transcript.decision_id == decision_id)
            .first()
        )

    def create(
        self,
        decision_id: str,
        source_type: str,
        content: str,
        file_name: str | None,
        extracted_information: dict,
        ai_model: str | None = None,
        ai_usage: dict | None = None,
    ) -> Transcript:
        transcript = Transcript(
            decision_id=decision_id,
            source_type=source_type,
            file_name=file_name,
            content=content,
            extracted_summary=extracted_information["decision_topic"],
            extracted_options="|".join(extracted_information["options"]),
            extracted_criteria="|".join(extracted_information["criteria"]),
            extracted_payload=extracted_information,
            ai_model=ai_model,
            ai_usage=ai_usage,
        )
        self.db.add(transcript)
        self.db.commit()
        self.db.refresh(transcript)
        return transcript
