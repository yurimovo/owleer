from datetime import datetime, timedelta
import logging

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import text
from sqlalchemy.future import select


from app import models
from app.auth import user_in_db
from app.database import get_db


async def fetch_project_stats_for_user(
    db: AsyncSession, user_id: int, from_date: datetime, till_date: datetime
):
    """
    Fetch user's project stats in a perioud of time.

    Arguments:
        db: (AsyncSession) Database session.
        user_id: (int) Target user ID.
        from_date: (datetime) From date UTC.
        till_date: (datetime) Till date UTC.
    """
    db_query = text(
        f"""
    SELECT public.project_files.project_id, 
           COUNT(public.project_files.project_id) as files_count 
    FROM public.user_project_associations
    JOIN public.project_files ON  public.user_project_associations.project_id = public.project_files.project_id 
    WHERE public.user_project_associations.user_id=:user_id 
    AND public.project_files.created_at >= :from_date
    AND public.project_files.created_at <= :till_date
    GROUP BY public.project_files.project_id 
    """
    )
    projects_status = {}

    results = (
        await db.execute(
            db_query,
            {"user_id": user_id, "from_date": from_date, "till_date": till_date},
        )
    ).fetchall()

    for r in results:
        try:
            projects_status[r[0]] = {"new_files_count": r[1]}

        except Exception as err:
            logging.exception(err)

    return projects_status


# Dependencies.
async def fetch_projects_stats_last_week(
    user=Depends(user_in_db), db: AsyncSession = Depends(get_db)
):
    stats = await fetch_project_stats_for_user(
        db=db,
        user_id=user.id,
        from_date=datetime.utcnow() - timedelta(days=7),
        till_date=datetime.utcnow(),
    )
    return stats
