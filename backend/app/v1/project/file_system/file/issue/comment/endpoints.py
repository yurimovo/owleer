from datetime import datetime
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
from app.v1.project.file_system.file.issue.comment import dependencies as comment_dep
from app.config import get_settings

settings = get_settings()


class Comment(BaseModel):
    parent_comment_uid: Optional[str]
    text: Optional[str]
    data: Optional[Dict] = {}


async def create_comment(
    comment: Comment,
    issue: types.ProjectFileIssue = Depends(issues_dep.get_issue),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    comment_uid = models.generate_uid()
    parent_comment_id = None

    if comment.parent_comment_uid:
        orm_parent_comment: models.ProjectFileIssueComment = (
            await db.execute(
                select(models.ProjectFileIssueComment).filter_by(
                    uid=comment.parent_comment_uid
                )
            )
            .scalars()
            .first()
        )
        parent_comment_id = orm_parent_comment.id

    if issue.user.uid != user.uid:
        await run_in_threadpool(
            tasks.email.send_dynamic_template.delay,
            send_from=settings.sendgrid_sender_mail
            if "osherdavid.com" not in user.email
            else user.email,
            send_to=[issue.user.email],
            template_id=settings.sendgrid_template_id_comment_added_to_issue,
            name=f"{user.name} - {user.role}",
            dynamic_template_data={
                "project_name": issue.file.project.name,
                "comment_sender": user.name,
                "issue_name": issue.name,
                "file_uid": issue.file.uid,
            },
        )

    db.add(
        models.ProjectFileIssueComment(
            uid=comment_uid,
            parent_comment_id=parent_comment_id,
            text=comment.text,
            user_id=user.id,
            issue_id=issue.id,
            data=comment.data,
        )
    )

    file_metadata = models.decode_s3_external_storage_id(issue.file.external_storage_id)

    tasks.event.add_event.delay(
        initiator_id=user.id,
        project_id=issue.file.project.id,
        event_type=tasks.event.EventTypes.COMMENT_PLACED.value,
        event_name=f"{user.name} - {user.role} placed new comment on issue '{issue.name}' on file {file_metadata['file_key']}",
        data={"file_uid": issue.file.uid},
    )

    return {"uid": comment_uid}


async def delete_comment(
    comment: types.ProjectFileIssueCommentBase = Depends(comment_dep.get_comment),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    if comment.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    orm_file_issue_comment: models.ProjectFileIssueComment = (
        await db.execute(
            select(models.ProjectFileIssueComment).filter_by(uid=comment.uid)
        )
        .scalars()
        .first()
    )

    await db.delete(orm_file_issue_comment)


async def update_comment(
    update_data: Comment,
    comment: types.ProjectFileIssueCommentBase = Depends(comment_dep.get_comment),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):

    if comment.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    orm_file_issue_comment: models.ProjectFileIssue = (
        await db.execute(select(models.ProjectFileIssue).filter_by(uid=comment.uid))
        .scalars()
        .first()
    )

    orm_file_issue_comment.text = orm_file_issue_comment.text or update_data.text
    orm_file_issue_comment.data = orm_file_issue_comment.data or update_data.data
