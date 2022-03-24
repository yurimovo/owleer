from typing import List

from fastapi import Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select


from app import models, types
from app.auth import user_in_db
from app.database import get_db


async def get_issue(
    issue_uid: str, user=Depends(user_in_db), db: AsyncSession = Depends(get_db)
):
    orm_file_issue: models.ProjectFileIssue = (
        (
            await db.execute(
                select(models.ProjectFileIssue)
                .filter_by(uid=issue_uid)
                .options(selectinload(models.ProjectFileIssue.user))
                .options(
                    selectinload(models.ProjectFileIssue.file)
                    .selectinload(models.ProjectFile.project)
                    .selectinload(models.Project.users)
                )
            )
        )
        .scalars()
        .first()
    )

    if not orm_file_issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    assosiated_user_ids = [ua.user_id for ua in orm_file_issue.file.project.users]

    if user.id not in assosiated_user_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    return types.ProjectFileIssue.from_orm(orm_file_issue)


async def fetch_comments(
    issue: types.ProjectFileIssue = Depends(get_issue),
    db: AsyncSession = Depends(get_db),
):
    comments: List[models.ProjectFileIssueComment] = (
        (
            await db.execute(
                select(models.ProjectFileIssueComment)
                .filter_by(issue_id=issue.id)
                .options(selectinload(models.ProjectFileIssueComment.user))
            )
        )
        .scalars()
        .all()
    )

    return [types.ProjectFileIssueComment.from_orm(c) for c in comments]
