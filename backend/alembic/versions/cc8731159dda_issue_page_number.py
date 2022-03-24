"""Issue page number

Revision ID: cc8731159dda
Revises: 9d8c1b4e137f
Create Date: 2022-01-17 18:50:52.418932

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "cc8731159dda"
down_revision = "9d8c1b4e137f"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("project_file_issues", sa.Column("page", sa.Integer(), nullable=True))
    op.create_index(
        op.f("ix_project_file_issues_page"),
        "project_file_issues",
        ["page"],
        unique=False,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_project_file_issues_page"), table_name="project_file_issues")
    op.drop_column("project_file_issues", "page")
    # ### end Alembic commands ###