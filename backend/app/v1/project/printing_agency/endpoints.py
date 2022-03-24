from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime
from xmlrpc.client import boolean

from fastapi import Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select

from app.auth import user_in_db
from app.database import get_db
from app import models, types, tasks, path_ops, storage
from app.config import get_settings

settings = get_settings()


# Models
class PrintingAgency(BaseModel):
    uid: str
    name: str
    email: str
    works: Optional[List[str]] = []


class CreatePrintingAgency(BaseModel):
    name: str
    email: str
    works: Optional[List[str]] = []


# Endpoints
async def list_project_printing_agencies(
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
):
    orm_agencies: List[models.ProjectPrintingAgency] = (
        (
            await db.execute(
                select(models.ProjectPrintingAgency).filter(
                    models.ProjectPrintingAgency.project_id == project.id
                )
            )
        )
        .scalars()
        .all()
    )

    return [
        PrintingAgency(uid=a.uid, name=a.name, email=a.email, works=a.works)
        for a in orm_agencies
    ]


async def create_printing_agency(
    create_data: CreatePrintingAgency,
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    user=Depends(user_in_db),
):
    admin_user_association = next(
        (ua for ua in project.users if ua.user.id == user.id and ua.is_admin), None
    )

    if not admin_user_association:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to edit project.",
        )

    db.add(
        models.ProjectPrintingAgency(
            name=create_data.name, email=create_data.email, works=create_data.works
        )
    )
