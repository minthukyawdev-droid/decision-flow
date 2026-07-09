from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.responses import raise_error
from app.repositories.decision_repository import DecisionRepository
from app.repositories.transcript_repository import TranscriptRepository
from app.services.ai_errors import AiServiceError
from app.services.ai_service import OpenRouterDecisionFlowService


class TranscriptService:
    allowed_content_types = {"text/plain", "text/markdown"}
    allowed_file_extensions = {".txt", ".md", ".markdown"}

    def __init__(self, db: Session):
        self.decision_repository = DecisionRepository(db)
        self.transcript_repository = TranscriptRepository(db)
        self.extraction_service = OpenRouterDecisionFlowService()
        self.settings = get_settings()

    def list_transcripts(self, decision_id: str, user_id: str):
        self._get_owned_decision(decision_id, user_id)
        return self.transcript_repository.list_for_decision(decision_id)

    async def create_from_upload(self, decision_id: str, user_id: str, file: UploadFile):
        self._get_owned_decision(decision_id, user_id)
        if not self._is_supported_upload(file):
            raise_error(400, "Only plain text or markdown transcript files are supported")

        raw_content = await file.read()
        if len(raw_content) > self.settings.max_transcript_upload_bytes:
            raise_error(413, "Transcript file exceeds the configured size limit")

        try:
            content = raw_content.decode("utf-8")
        except UnicodeDecodeError:
            raise_error(400, "Transcript file must be UTF-8 encoded text")

        if not content.strip():
            raise_error(400, "Transcript content cannot be empty")

        extracted_information = self._extract_information(content)
        return self.transcript_repository.create(
            decision_id=decision_id,
            source_type="upload",
            content=content,
            file_name=file.filename,
            extracted_information=extracted_information.data.model_dump(),
            ai_model=extracted_information.model,
            ai_usage=extracted_information.usage,
        )

    def create_from_paste(self, decision_id: str, user_id: str, content: str):
        self._get_owned_decision(decision_id, user_id)
        self._validate_content(content)
        extracted_information = self._extract_information(content)
        return self.transcript_repository.create(
            decision_id=decision_id,
            source_type="paste",
            content=content,
            file_name=None,
            extracted_information=extracted_information.data.model_dump(),
            ai_model=extracted_information.model,
            ai_usage=extracted_information.usage,
        )

    def get_extracted_information(self, decision_id: str, transcript_id: str, user_id: str) -> dict:
        self._get_owned_decision(decision_id, user_id)
        transcript = self.transcript_repository.get_for_decision(transcript_id, decision_id)
        if not transcript:
            raise_error(404, "Transcript not found")
        return self._serialize_extracted_information(transcript)

    def _get_owned_decision(self, decision_id: str, user_id: str):
        decision = self.decision_repository.get_for_user(decision_id, user_id)
        if not decision:
            raise_error(404, "Decision not found")
        return decision

    def _serialize_extracted_information(self, transcript) -> dict:
        if transcript.extracted_payload:
            return {
                "summary": transcript.extracted_payload.get("decision_topic", transcript.extracted_summary or ""),
                **transcript.extracted_payload,
            }
        return {
            "summary": transcript.extracted_summary or "",
            "decision_topic": transcript.extracted_summary or "",
            "options": transcript.extracted_options.split("|") if transcript.extracted_options else [],
            "criteria": transcript.extracted_criteria.split("|") if transcript.extracted_criteria else [],
            "stakeholders": [],
            "risks": [],
            "action_items": [],
        }

    def _extract_information(self, content: str):
        self._validate_content(content)
        try:
            return self.extraction_service.extract_transcript(content)
        except AiServiceError as exc:
            raise_error(exc.status_code, exc.message, exc.details)

    def _validate_content(self, content: str) -> None:
        if not content or not content.strip():
            raise_error(400, "Transcript content cannot be empty")
        if len(content) > self.settings.max_ai_input_chars:
            raise_error(413, "Transcript content is too large for AI extraction")
        control_chars = [char for char in content if ord(char) < 32 and char not in "\r\n\t"]
        if control_chars:
            raise_error(400, "Transcript content contains unsupported control characters")

    def _is_supported_upload(self, file: UploadFile) -> bool:
        if file.content_type in self.allowed_content_types:
            return True
        filename = (file.filename or "").lower()
        return any(filename.endswith(extension) for extension in self.allowed_file_extensions)
