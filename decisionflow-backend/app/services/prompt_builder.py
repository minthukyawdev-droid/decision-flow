from functools import lru_cache
import json
from pathlib import Path

PROMPT_DIR = Path(__file__).resolve().parents[2] / "prompts"


@lru_cache
def load_prompt(name: str) -> str:
    path = PROMPT_DIR / name
    return path.read_text(encoding="utf-8").strip()


class PromptBuilder:
    def system_prompt(self) -> str:
        return load_prompt("system.md")

    def transcript_extraction_prompt(self, content: str) -> str:
        return f"{load_prompt('transcript_extraction.md')}\n\nCONTENT:\n{content}"

    def recommendation_prompt(self, context: dict) -> str:
        return f"{load_prompt('recommendation.md')}\n\nDECISION CONTEXT:\n{json.dumps(context, ensure_ascii=True)}"
