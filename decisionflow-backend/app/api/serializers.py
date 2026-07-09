from app.models.decision import Decision
from app.models.recommendation import Recommendation
from app.models.transcript import Transcript


def serialize_decision(decision: Decision) -> dict:
    latest_transcript = max(decision.transcripts, key=lambda transcript: transcript.created_at, default=None)
    latest_recommendation = max(
        decision.recommendations,
        key=lambda recommendation: recommendation.created_at,
        default=None,
    )

    return {
        "id": decision.id,
        "title": decision.title,
        "description": decision.description,
        "status": decision.status,
        "latest_transcript_id": latest_transcript.id if latest_transcript else None,
        "latest_recommendation": (
            serialize_recommendation(latest_recommendation) if latest_recommendation else None
        ),
        "transcript_count": len(decision.transcripts),
        "criteria": [
            {
                "id": criterion.id,
                "name": criterion.name,
                "description": criterion.description,
                "weight": criterion.weight,
            }
            for criterion in decision.criteria
        ],
        "created_at": decision.created_at.isoformat(),
        "updated_at": decision.updated_at.isoformat(),
    }


def serialize_transcript(transcript: Transcript) -> dict:
    extracted_information = None
    if transcript.extracted_payload:
        extracted_information = {
            "summary": transcript.extracted_payload.get("decision_topic", transcript.extracted_summary or ""),
            **transcript.extracted_payload,
        }
    elif transcript.extracted_summary is not None:
        extracted_information = {
            "summary": transcript.extracted_summary,
            "decision_topic": transcript.extracted_summary,
            "options": transcript.extracted_options.split("|") if transcript.extracted_options else [],
            "criteria": transcript.extracted_criteria.split("|") if transcript.extracted_criteria else [],
            "stakeholders": [],
            "risks": [],
            "action_items": [],
        }
    return {
        "id": transcript.id,
        "source_type": transcript.source_type,
        "file_name": transcript.file_name,
        "content": transcript.content,
        "extracted_information": extracted_information,
        "created_at": transcript.created_at.isoformat(),
    }


def serialize_recommendation(recommendation: Recommendation) -> dict:
    payload = recommendation.recommendation_payload or {}
    return {
        "id": recommendation.id,
        "recommended_option": recommendation.recommended_option,
        "rationale": recommendation.rationale,
        "confidence_score": recommendation.confidence_score,
        "recommendation": payload.get("recommendation", recommendation.recommended_option),
        "confidence": payload.get("confidence", recommendation.confidence_score / 100),
        "reasoning": payload.get("reasoning", [recommendation.rationale] if recommendation.rationale else []),
        "risks": payload.get("risks", []),
        "alternatives": payload.get("alternatives", []),
        "next_steps": payload.get("next_steps", []),
        "created_at": recommendation.created_at.isoformat(),
    }
