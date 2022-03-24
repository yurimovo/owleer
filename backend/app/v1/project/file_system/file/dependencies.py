from typing import List, Optional

from fastapi import Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from pydantic import BaseModel


from app import models, types
from app.auth import user_in_db
from app.database import get_db


class IssuesFilters(BaseModel):
    user_emails: Optional[List[str]] = []
    page: Optional[int]


async def get_file(
    file_uid: str, user=Depends(user_in_db), db: AsyncSession = Depends(get_db)
):
    orm_file: models.ProjectFile = (
        (
            await db.execute(
                select(models.ProjectFile)
                .filter_by(uid=file_uid)
                .options(
                    selectinload(models.ProjectFile.project)
                    .selectinload(models.Project.users)
                    .selectinload(models.UserProjectAssociation.user)
                )
            )
        )
        .scalars()
        .first()
    )

    if not orm_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File with uid: {file_uid} was not found.",
        )

    associated_users_ids = [ua.user.id for ua in orm_file.project.users]

    if user.id not in associated_users_ids:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User is not authorized to access project with uid: {file_uid}",
        )

    return types.ProjectFile.from_orm(orm_file)


async def fetch_issues(
    filters: Optional[IssuesFilters],
    user=Depends(user_in_db),
    file_: types.ProjectFile = Depends(get_file),
    db: AsyncSession = Depends(get_db),
):
    issues: List[models.ProjectFileIssue] = (
        (
            await db.execute(
                select(models.ProjectFileIssue)
                .filter_by(file_id=file_.id)
                .filter_by(page=filters.page)
                .options(selectinload(models.ProjectFileIssue.user))
            )
        )
        .scalars()
        .all()
    )

    if filters.user_emails:
        filtered_issues = [i for i in issues if i.user.email in filters.user_emails]
        issues = filtered_issues

    return [
        {
            **types.ProjectFileIssueInList.from_orm(i).dict(),
            "is_owner": i.user.id == user.id,
        }
        for i in issues
    ]
