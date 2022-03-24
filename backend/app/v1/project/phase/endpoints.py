from typing import List, Dict, Optional

from pydantic import BaseModel
from fastapi import Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.auth import user_in_db
from app.database import get_db
from app import models


# Request Models.
class ProjectPhase(BaseModel):
    name: str
    data: Optional[Dict] = {}


class UpdateProjectPhase(BaseModel):
    name: Optional[str]
    data: Optional[Dict] = {}


# Response Models.
class ResponsePhase(BaseModel):
    uid: str
    name: str
    data: Optional[Dict] = {}


async def create_project_phase(
    phase_data: ProjectPhase,
    project_uid: str,
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    project: models.Project = (
        await db.execute(select(models.Project).filter_by(uid=project_uid))
    ).scalar()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found."
        )

    user_association = next((u for u in project.users if u.user_id == user.id), None)

    if not user_association or (user_association and not user_association.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    phase = models.ProjectPhase(
        name=phase_data.name, data=phase_data.data or {}, project_id=project.id
    )

    db.add(phase)
    db.commit()
    return ResponsePhase(uid=phase.uid, name=phase.name, data=phase.data)


async def update_project_phase(
    phase_data: UpdateProjectPhase,
    project_uid: str,
    phase_uid: str,
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):

    phase: models.ProjectPhase = (
        await db.execute(
            select(models.ProjectPhase)
            .filter_by(uid=phase_uid)
            .options(selectinload(models.ProjectPhase.project))
        )
    ).scalar()

    if not phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Phase not found."
        )

    if project_uid is not phase.project.uid:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)

    user_association = next(
        (u for u in phase.project.users if u.user_id == user.id), None
    )

    if not user_association or (user_association and not user_association.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    phase.name = phase_data.name or phase.name
    phase.data = phase_data.data or phase.data


async def delete_project_phase(
    project_uid: str,
    phase_uid: str,
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    phase: models.ProjectPhase = (
        await db.execute(
            select(models.ProjectPhase)
            .filter_by(uid=phase_uid)
            .options(selectinload(models.ProjectPhase.project))
        )
    ).scalar()

    if not phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Phase not found."
        )

    if project_uid is not phase.project.uid:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)

    user_association = next(
        (u for u in phase.project.users if u.user_id == user.id), None
    )

    if not user_association or (user_association and not user_association.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    await db.delete(phase)


async def list_phases(
    project_uid: str,
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    project: models.Project = (
        await db.execute(
            select(models.Project)
            .filter_by(uid=project_uid)
            .options(selectinload(models.Project.phases))
        )
    ).scalar()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found."
        )

    user_association = next((u for u in project.users if u.user_id == user.id), None)

    if not user_association or (user_association and not user_association.is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    return [
        {"name": p.name, "data": p.data or {}, "uid": p.uid} for p in project.phases
    ]
