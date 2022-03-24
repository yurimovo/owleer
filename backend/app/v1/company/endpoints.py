from typing import Optional, List

from fastapi import Response, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.auth import user_in_db
from app.database import get_db
from app import models, types, path_ops


# Models.
class CompanyMember(BaseModel):
    email: str


class UpdateCompany(BaseModel):
    name: Optional[str]
    image_url: Optional[str]


class CreateCompany(BaseModel):
    name: str
    image_url: Optional[str]
    members_emails: Optional[List[str]] = []


# Endpoints.
async def get_companies_list(
    user=Depends(user_in_db), db: AsyncSession = Depends(get_db)
):
    companies_user_links: List[models.UserCompanyAssociation] = (
        (
            await db.execute(
                select(models.UserCompanyAssociation)
                .filter_by(user_id=user.id)
                .options(
                    selectinload(models.UserCompanyAssociation.company)
                    .selectinload(models.Company.users)
                    .selectinload(models.UserCompanyAssociation.user)
                )
            )
        )
        .scalars()
        .all()
    )

    return [
        {
            **types.CompanyBase.from_orm(ca.company).dict(exclude={"id"}),
            "is_admin": ca.is_admin,
        }
        for ca in companies_user_links
    ]


async def get_company(company: types.Company = Depends(path_ops.get_company)):
    return company


async def delete_company(
    company: types.Company = Depends(path_ops.get_company),
    user: types.User = Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    company: models.Company = (
        await db.execute(
            select(models.Company)
            .filter_by(uid=company.uid)
            .options(
                selectinload(models.Company.users),
                selectinload(models.Company.projects),
            )
        )
    ).scalar_one()

    owner_company_association: models.UserCompanyAssociation = (
        await db.execute(
            select(models.UserCompanyAssociation).filter_by(
                company_id=company.id, user_id=user.id, is_admin=True
            )
        )
    ).scalar()

    if not owner_company_association:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    for ua in company.users:
        await db.delete(ua)

    for pa in company.projects:
        await db.delete(pa)

    await db.delete(company)


async def create_company(
    company_data: CreateCompany,
    response: Response,
    user: types.User = Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    company = models.Company(name=company_data.name, image_url=company_data.image_url)

    # Add Current User As Admin.
    company.users.append(models.UserCompanyAssociation(user_id=user.id, is_admin=True))

    # Set Members.
    for m_email in company_data.members_emails:
        if m_email is not user.email:
            p_user: models.User = (
                await db.execute(select(models.User).filter_by(email=m_email))
            ).scalar()

            if not p_user:
                p_user = models.User(email=m_email)
                print("todo send email to user")

            company.users.append(models.UserCompanyAssociation(user=p_user))

    db.add(company)
    response.status_code = status.HTTP_201_CREATED
    return


async def update_company(
    company_uid: str,
    company_data: UpdateCompany,
    user: types.User = Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    company: models.Company = (
        await db.execute(select(models.Company).filter_by(uid=company_uid))
    ).scalar_one()

    owner_company_association: models.UserCompanyAssociation = (
        await db.execute(
            select(models.UserCompanyAssociation).filter_by(
                company_id=company.id, user_id=user.id, is_admin=True
            )
        )
    ).scalar()

    if not owner_company_association:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    company.name = company_data.name or company.name
    company.image_url = company_data.image_url or company.image_url


async def remove_member(
    member: CompanyMember,
    company: types.Company = Depends(path_ops.get_company),
    db: AsyncSession = Depends(get_db),
):

    m: models.User = (
        await db.execute(select(models.User).filter_by(email=member.email))
    ).scalar()

    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    user_company_association: models.UserCompanyAssociation = (
        await db.execute(
            select(models.UserCompanyAssociation).filter_by(
                user_id=m.id, company_id=company.id
            )
        )
    ).scalar()

    if user_company_association:
        await db.delete(user_company_association)


async def add_member(
    member: CompanyMember,
    company: types.Company = Depends(path_ops.get_company),
    db: AsyncSession = Depends(get_db),
):
    m: models.User = (
        await db.execute(select(models.User).filter_by(email=member.email))
    ).scalar()

    if not m:
        m = models.User(email=member.email)

    user_company_association = models.UserCompanyAssociation(
        user=m, company_id=company.id
    )

    db.add(user_company_association)


async def search(
    query: str,
    db: AsyncSession = Depends(get_db),
    user: types.User = Depends(user_in_db),
):
    if not query:
        return []

    companies: List[models.Company] = (
        (
            (
                await db.execute(
                    select(models.Company).filter(
                        models.Company.name.like(f"%{query}%")
                    )
                )
            )
        )
        .scalars()
        .all()
    )

    return [types.CompanyBase.from_orm(c).dict(exclude={"id"}) for c in companies]
