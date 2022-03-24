from asyncio import events
from datetime import datetime
from typing import List, Dict, Optional
from enum import Enum
from xmlrpc.client import boolean

from fastapi import Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy import func

from app.auth import user_in_db
from app.database import get_db
from app import models, types, path_ops
from app.config import get_settings

settings = get_settings()


# Models.
class NotifyEventsUpdate(BaseModel):
    notify: boolean


class EventInitiator(BaseModel):
    uid: str
    name: str
    role: str
    email: str


class ProjectEvent(BaseModel):
    uid: str
    name: str
    type: str
    data: Optional[Dict] = {}
    created_at: datetime
    initiator: EventInitiator


class ListEvents(BaseModel):
    events: List[ProjectEvent] = []
    total: int = 0


# Endpoints
async def paginate_events(
    page: int = 0,
    size: int = 100,
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    user: types.UserBase = Depends(user_in_db),
):
    user_project_admin = (
        (
            await db.execute(
                select(models.UserProjectAssociation).filter_by(
                    user_id=user.id, project_id=project.id, is_admin=True
                )
            )
        )
        .scalars()
        .first()
    )

    if not user_project_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    base_quey = (
        select(models.ProjectEvent)
        .filter(models.ProjectEvent.project_id == project.id)
        .options(selectinload(models.ProjectEvent.initiator))
        .order_by(models.ProjectEvent.created_at.desc())
    )

    total: int = (
        (await db.execute(select(func.count()).select_from(base_quey)))
    ).scalar_one()

    orm_events: List[models.ProjectEvent] = (
        ((await db.execute(base_quey.offset(size * page).limit(size)))).scalars().all()
    )

    model_events = [
        ProjectEvent(
            uid=e.uid,
            name=e.name,
            type=e.type,
            data=e.data,
            created_at=e.created_at,
            initiator=EventInitiator(
                uid=e.initiator.uid,
                name=e.initiator.name,
                role=e.initiator.role,
                email=e.initiator.email,
            ),
        )
        for e in orm_events
    ]

    return ListEvents(events=model_events, total=total)


async def notify_events(
    notify: NotifyEventsUpdate,
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    user: types.UserBase = Depends(user_in_db),
):
    user_project_admin: models.UserProjectAssociation = (
        (
            await db.execute(
                select(models.UserProjectAssociation).filter_by(
                    user_id=user.id, project_id=project.id, is_admin=True
                )
            )
        )
        .scalars()
        .first()
    )

    if not user_project_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    user_project_admin.notify = notify.notify
