"""Integrations

Revision ID: c3b5d57649d0
Revises: c2f0bc2228a2
Create Date: 2021-11-07 16:46:18.874550

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import sqlalchemy_utils

# revision identifiers, used by Alembic.
revision = "c3b5d57649d0"
down_revision = "6ebd1b9737e8"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "integrations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("type", sa.String(), nullable=True),
        sa.Column("payload", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "secrets",
            sqlalchemy_utils.types.encrypted.encrypted_type.EncryptedType(),
            nullable=True,
        ),
        sa.Column("uid", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_integrations_uid"), "integrations", ["uid"], unique=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_integrations_uid"), table_name="integrations")
    op.drop_table("integrations")
    # ### end Alembic commands ###