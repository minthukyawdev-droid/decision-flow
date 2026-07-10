from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DecisionFlow Backend"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://decisionflow:decisionflow@localhost:5432/decisionflow"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    frontend_origins: str = "http://localhost:3000,http://localhost:5173"
    max_transcript_upload_bytes: int = Field(default=5 * 1024 * 1024, ge=1)
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "~openai/gpt-latest"
    openrouter_site_url: str = ""
    openrouter_app_name: str = "DecisionFlow"
    ai_temperature: float = Field(default=0.2, ge=0, le=2)
    ai_timeout_seconds: float = Field(default=30, ge=1)
    ai_max_retries: int = Field(default=2, ge=0)
    max_ai_input_chars: int = Field(default=60_000, ge=1)

    @field_validator("database_url", mode="before")
    @classmethod
    def use_psycopg_driver(cls, value: str) -> str:
        """Normalize provider PostgreSQL URLs for the installed psycopg v3 driver."""
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        return value

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
