from typing import Dict, Optional, List

from fastapi import Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


from pydantic import BaseModel
from sqlalchemy.sql.functions import mode

from app import models, types, tasks
from app.database import get_db
from app.auth import user_in_db
from app.v1.project.file_system.file.issue import dependencies as issues_dep
from app.v1.project.file_system.file import dependencies as files_dep
from app.config import get_settings

settings = get_settings()


class FilePage(BaseModel):
    data: Optional[Dict] = {}


async def upsert_page_data(
    file_page: FilePage,
    page_number: int,
    file_: types.ProjectFile = Depends(files_dep.get_file),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    orm_file_page: models.ProjectFilePage = (
        (
            await db.execute(
                select(models.ProjectFilePage)
                .filter_by(number=page_number)
                .filter_by(file_id=file_.id)
            )
        )
        .scalars()
        .first()
    )

    if not orm_file_page:
        orm_file_page = models.ProjectFilePage(
            file_id=file_.id, number=page_number, data=file_page.data
        )

    orm_file_page.data = file_page.data

    db.add(orm_file_page)


async def fetch_page_data(
    page_number: int,
    file_: types.ProjectFile = Depends(files_dep.get_file),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):

    orm_file_page: models.ProjectFilePage = (
        (
            await db.execute(
                select(models.ProjectFilePage)
                .filter_by(number=page_number)
                .filter_by(file_id=file_.id)
            )
        )
        .scalars()
        .first()
    )

    if not orm_file_page:
        return {}

    return orm_file_page.data or {}
