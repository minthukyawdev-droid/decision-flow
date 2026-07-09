from app.models.decision import Decision


class ContextBuilder:
    def build_recommendation_context(self, decision: Decision, options: list[str]) -> dict:
        transcripts = sorted(decision.transcripts, key=lambda item: item.created_at, reverse=True)
        latest_extraction = transcripts[0].extracted_payload if transcripts and transcripts[0].extracted_payload else {}

        return {
            "decision": {
                "title": decision.title,
                "description": decision.description or "",
                "status": decision.status,
            },
            "options": options or latest_extraction.get("options", []),
            "criteria": [
                {
                    "name": criterion.name,
                    "description": criterion.description or "",
                    "weight": criterion.weight,
                }
                for criterion in decision.criteria
            ],
            "extracted_information": latest_extraction,
        }
