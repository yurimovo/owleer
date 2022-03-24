import datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from fastapi import Depends, status
from fastapi.exceptions import HTTPException
from pydantic import BaseModel


from app import models, types
from app.auth import user_in_db
from app.database import get_db

# Helper Models.
class OwnerCompany(BaseModel):
    uid: Optional[str]
    name: Optional[str]
    image_uri: Optional[str]


class EnrichedProject(types.Project):
    is_admin: bool
    subscribe: Optional[bool]
    owner_company: Optional[OwnerCompany] = {
        "uid": None,
        "name": None,
        "image_uri": None,
    }


# Time Ops.
class DateTimeGenerator(object):
    def __init__(self, days_ago: int = 0) -> None:
        self.days_ago = days_ago

    def __call__(self):
        return datetime.datetime.now() - datetime.timedelta(days=self.days_ago)


# Ops.
async def get_company(
    company_uid: str, user=Depends(user_in_db), db: AsyncSession = Depends(get_db)
):
    """
    Get company for authorized user.

    Arguments:
        company_uid: (string) Target company UID.
        user: (types.User) Authorized user object.
        db: (AsyncSession) Current db session.

    Returns:
        Company object (types.Company).
    """
    company: models.Company = (
        (
            await db.execute(
                select(models.Company)
                .filter_by(uid=company_uid)
                .options(
                    selectinload(models.Company.users).selectinload(
                        models.UserCompanyAssociation.user
                    )
                )
            )
        )
        .scalars()
        .first()
    )

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with uid: {company_uid} was not found.",
        )

    associated_users_ids = [ua.user.id for ua in company.users]

    if user.id not in associated_users_ids:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User is not authorized to access company with uid: {company_uid}",
        )

    return types.Company.from_orm(company)


async def get_project(
    project_uid: str, user=Depends(user_in_db), db: AsyncSession = Depends(get_db)
):
    """
    Get project for authorized user.

    Arguments:
        project_uid: (string) Target project UID.
        user: (types.User) Authorized user object.
        db: (AsyncSession) Current db session.

    Returns:
        Project object (types.Project).
    """
    project: models.Project = (
        (
            await db.execute(
                select(models.Project)
                .filter_by(uid=project_uid)
                .options(
                    selectinload(models.Project.users).selectinload(
                        models.UserProjectAssociation.user
                    )
                )
                .options(
                    selectinload(models.Project.companies).selectinload(
                        models.CompanyProjectAssociation.company
                    )
                )
            )
        )
        .scalars()
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with uid: {project_uid} was not found.",
        )

    associated_users_ids = {}

    for ua in project.users:
        associated_users_ids.update(
            {ua.user.id: {"is_admin": ua.is_admin, "subscribe": ua.subscribe}}
        )

    if user.id not in list(associated_users_ids.keys()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User is not authorized to access project with uid: {project_uid}",
        )

    project_dict = types.Project.from_orm(project).dict()

    owner_company: models.Company = next(
        (x.company for x in project.companies if x.is_admin),
        None,
    )

    if owner_company:
        project_dict.update(
            {
                "owner_company": {
                    "uid": owner_company.uid,
                    "name": owner_company.name,
                    "image_uri": owner_company.image_url,
                }
            }
        )

    project_dict.update(associated_users_ids[user.id])

    return EnrichedProject.parse_obj(project_dict)
