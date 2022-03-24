from fastapi import Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select


from app import models, types
from app.auth import user_in_db
from app.database import get_db


async def get_comment(
    comment_uid: str, user=Depends(user_in_db), db: AsyncSession = Depends(get_db)
):
    orm_file_issue_comment: models.ProjectFileIssueComment = (
        (
            await db.execute(
                select(models.ProjectFileIssueComment).filter_by(uid=comment_uid)
            )
        )
        .scalars()
        .first()
    )

    if not orm_file_issue_comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    if user.id != orm_file_issue_comment.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    return types.ProjectFileCommentBase.from_orm(orm_file_issue_comment)
