"""initial schema

Revision ID: 202607070001
Revises:
Create Date: 2026-07-07 00:01:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "202607070001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "decisions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_decisions_user_id"), "decisions", ["user_id"], unique=False)

    op.create_table(
        "criteria",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("decision_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("weight", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["decision_id"], ["decisions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_criteria_decision_id"), "criteria", ["decision_id"], unique=False)

    op.create_table(
        "decision_history",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("decision_id", sa.String(length=36), nullable=False),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["decision_id"], ["decisions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_decision_history_decision_id"), "decision_history", ["decision_id"], unique=False)

    op.create_table(
        "recommendations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("decision_id", sa.String(length=36), nullable=False),
        sa.Column("recommended_option", sa.String(length=200), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("confidence_score", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["decision_id"], ["decisions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_recommendations_decision_id"), "recommendations", ["decision_id"], unique=False)

    op.create_table(
        "transcripts",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("decision_id", sa.String(length=36), nullable=False),
        sa.Column("source_type", sa.String(length=40), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("extracted_summary", sa.Text(), nullable=True),
        sa.Column("extracted_options", sa.Text(), nullable=True),
        sa.Column("extracted_criteria", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["decision_id"], ["decisions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_transcripts_decision_id"), "transcripts", ["decision_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_transcripts_decision_id"), table_name="transcripts")
    op.drop_table("transcripts")
    op.drop_index(op.f("ix_recommendations_decision_id"), table_name="recommendations")
    op.drop_table("recommendations")
    op.drop_index(op.f("ix_decision_history_decision_id"), table_name="decision_history")
    op.drop_table("decision_history")
    op.drop_index(op.f("ix_criteria_decision_id"), table_name="criteria")
    op.drop_table("criteria")
    op.drop_index(op.f("ix_decisions_user_id"), table_name="decisions")
    op.drop_table("decisions")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
