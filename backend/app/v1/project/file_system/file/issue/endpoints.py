from typing import Dict, Optional, List

from fastapi import Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


from pydantic import BaseModel

from app import models, types, tasks
from app.database import get_db
from app.auth import user_in_db
from app.v1.project.file_system.file.issue import dependencies as issues_dep
from app.v1.project.file_system.file import dependencies as files_dep
from app.config import get_settings

settings = get_settings()


class Issue(BaseModel):
    name: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    page: Optional[int]
    data: Optional[Dict] = {}


async def create_issue(
    issue: Issue,
    target_file: types.ProjectFile = Depends(files_dep.get_file),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    issue_uid = models.generate_uid()

    db.add(
        models.ProjectFileIssue(
            uid=issue_uid,
            name=issue.name,
            description=issue.description,
            image_url=issue.image_url,
            page=issue.page,
            data=issue.data,
            file_id=target_file.id,
            user_id=user.id,
        )
    )

    file_metadata = models.decode_s3_external_storage_id(
        target_file.external_storage_id
    )

    tasks.event.add_event.delay(
        initiator_id=user.id,
        project_id=target_file.project.id,
        event_type=tasks.event.EventTypes.ISSUE_CREATED.value,
        event_name=f"{user.name} - {user.role} created new issue '{issue.name}' on file {file_metadata['file_key']}",
        data={"file_uid": target_file.uid},
    )

    return {"uid": issue_uid}


async def get_issue(
    issue: types.ProjectFileIssue = Depends(issues_dep.get_issue),
) -> types.ProjectFileIssue:
    return issue


async def delete_issue(
    issue: types.ProjectFileIssue = Depends(issues_dep.get_issue),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    if issue.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    orm_file_issue: models.ProjectFileIssue = (
        (await db.execute(select(models.ProjectFileIssue).filter_by(uid=issue.uid)))
        .scalars()
        .first()
    )

    await db.delete(orm_file_issue)


async def update_issue(
    update_data: Issue,
    issue: types.ProjectFileIssue = Depends(issues_dep.get_issue),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):

    if issue.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    orm_file_issue: models.ProjectFileIssue = (
        (await db.execute(select(models.ProjectFileIssue).filter_by(uid=issue.uid)))
        .scalars()
        .first()
    )

    orm_file_issue.name = update_data.name or orm_file_issue.name
    orm_file_issue.description = update_data.description or orm_file_issue.description
    orm_file_issue.image_url = update_data.image_url or orm_file_issue.image_url
    orm_file_issue.data = update_data.data or orm_file_issue.data


async def fetch_comments(
    comments: List[types.ProjectFileIssueComment] = Depends(issues_dep.fetch_comments),
) -> List[types.ProjectFileIssueComment]:
    return comments
