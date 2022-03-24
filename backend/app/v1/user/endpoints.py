from enum import auto
from typing import Dict, List, Optional

from fastapi import Depends
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
from pydantic.errors import DequeError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from starlette import status

from app.database import get_db
from app.auth import user_in_db, UserInDB
from app import models, types


class UpsertUser(BaseModel):
    name: Optional[str]
    email: Optional[str]
    company: Optional[str]
    role: Optional[str]
    phone: Optional[str]
    auth_token: Optional[str]
    data: Optional[Dict]


async def search(
    query: str,
    db: AsyncSession = Depends(get_db),
    user: types.User = Depends(user_in_db),
):
    if not query:
        return []

    companies: List[models.User] = (
        (
            (
                await db.execute(
                    select(models.User).filter(models.User.email.like(f"%{query}%"))
                )
            )
        )
        .scalars()
        .all()
    )

    return [
        types.UserBase.from_orm(c).dict(exclude={"id", "auth_Token"}) for c in companies
    ]


async def get_user(
    user=Depends(user_in_db),
):
    return types.User.from_orm(user).dict(exclude={"id"})


async def upsert_user(
    user_data: UpsertUser,
    user=Depends(UserInDB(auto_error=False)),
    db: AsyncSession = Depends(get_db),
):

    orm_user: models.User = (
        await db.execute(select(models.User).filter_by(email=user_data.email))
    ).scalar()

    if orm_user and user:
        if orm_user.id == user.id:
            orm_user.name = user_data.name if user_data.name else orm_user.name
            orm_user.email = user_data.email if user_data.email else orm_user.email
            orm_user.data = (
                {**orm_user.data, **(user_data.data or {})}
                if user_data.data
                else orm_user.data
            )
            orm_user.role = user_data.role if user_data.role else orm_user.role
            orm_user.phone = user_data.phone if user_data.phone else orm_user.phone

            if user_data.company:
                orm_user.data = {**orm_user.data, **{"company": user_data.company}}
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    elif orm_user and not user:
        orm_user.name = user_data.name or orm_user.name
        orm_user.email = user_data.email or orm_user.email
        orm_user.data = (
            {**(orm_user.data or {}), **{"company": user_data.company}}
            if user_data.company
            else orm_user.data
        )
        orm_user.role = user_data.role or orm_user.role
        orm_user.auth_token = user_data.auth_token or orm_user.auth_token
    else:
        db.add(
            models.User(
                name=user_data.name,
                email=user_data.email,
                data={"company": user_data.company},
                role=user_data.role,
                auth_token=user_data.auth_token,
            )
        )
