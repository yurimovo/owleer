"""Project Events

Revision ID: 0c3073574ea1
Revises: c2b9e08a1c19
Create Date: 2022-02-19 14:57:58.816884

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0c3073574ea1"
down_revision = "c2b9e08a1c19"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "project_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("type", sa.String(), nullable=True),
        sa.Column("data", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("initiator_id", sa.Integer(), nullable=True),
        sa.Column("uid", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["initiator_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_project_events_uid"), "project_events", ["uid"], unique=True
    )

    op.add_column(
        "user_project_associations", sa.Column("notify", sa.Boolean(), nullable=True)
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("user_project_associations", "notify")

    op.drop_index(op.f("ix_project_events_uid"), table_name="project_events")
    op.drop_table("project_events")
    # ### end Alembic commands ###
