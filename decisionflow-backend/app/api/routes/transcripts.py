from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.api.serializers import serialize_transcript
from app.core.responses import success_response
from app.db.session import get_db
from app.models.user import User
from app.schemas.transcript import TranscriptPasteRequest
from app.services.transcript_service import TranscriptService

router = APIRouter(prefix="/decisions/{decision_id}/transcripts", tags=["Transcripts"])


@router.get("")
def list_transcripts(
    decision_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transcripts = TranscriptService(db).list_transcripts(decision_id, current_user.id)
    return success_response([serialize_transcript(transcript) for transcript in transcripts], "Transcripts retrieved")


@router.post("/paste", status_code=201)
def paste_transcript(
    decision_id: str,
    payload: TranscriptPasteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transcript = TranscriptService(db).create_from_paste(decision_id, current_user.id, payload.content)
    return success_response(serialize_transcript(transcript), "Transcript pasted", 201)


@router.post("/upload", status_code=201)
async def upload_transcript(
    decision_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transcript = await TranscriptService(db).create_from_upload(decision_id, current_user.id, file)
    return success_response(serialize_transcript(transcript), "Transcript uploaded", 201)


@router.get("/{transcript_id}/extracted")
def review_extracted_information(
    decision_id: str,
    transcript_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    extracted_information = TranscriptService(db).get_extracted_information(
        decision_id=decision_id,
        transcript_id=transcript_id,
        user_id=current_user.id,
    )
    return success_response(extracted_information, "Extracted information retrieved")
