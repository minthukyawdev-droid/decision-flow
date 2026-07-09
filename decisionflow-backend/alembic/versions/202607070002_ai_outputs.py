"""store ai outputs and usage metadata

Revision ID: 202607070002
Revises: 202607070001
Create Date: 2026-07-07 06:30:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "202607070002"
down_revision: Union[str, None] = "202607070001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("transcripts", sa.Column("extracted_payload", sa.JSON(), nullable=True))
    op.add_column("transcripts", sa.Column("ai_model", sa.String(length=120), nullable=True))
    op.add_column("transcripts", sa.Column("ai_usage", sa.JSON(), nullable=True))

    op.add_column("recommendations", sa.Column("recommendation_payload", sa.JSON(), nullable=True))
    op.add_column("recommendations", sa.Column("ai_model", sa.String(length=120), nullable=True))
    op.add_column("recommendations", sa.Column("ai_usage", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("recommendations", "ai_usage")
    op.drop_column("recommendations", "ai_model")
    op.drop_column("recommendations", "recommendation_payload")

    op.drop_column("transcripts", "ai_usage")
    op.drop_column("transcripts", "ai_model")
    op.drop_column("transcripts", "extracted_payload")
