from typing import List
import logging

from fastapi import Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel


from app.v1.permission import permission
from app import models, types
from app.database import get_db
from app.auth import user_in_db


class GrantPermission(BaseModel):
    object_name: str
    object_uid: str
    user_email: str
    permission: str


async def delete_permission(
    permission_uid: str,
    db: AsyncSession = Depends(get_db),
    user: types.User = Depends(user_in_db),
):

    permission_orm: models.Permission = (
        (
            await db.execute(
                select(models.Permission).filter(
                    models.Permission.uid == permission_uid
                )
            )
        )
        .scalars()
        .first()
    )

    if not permission_orm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    is_permitted = await permission.permmited(
        db=db,
        user_id=user.id,
        object_name=permission_orm.object_name,
        object_uid=permission_orm.object_uid,
        type=models.PermissionTypes.EDIT,
    )

    if is_permitted:
        await db.delete(permission_orm)
        return

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)


async def get_permissions(
    object_uid: str,
    object_name: str,
    db: AsyncSession = Depends(get_db),
    user: types.User = Depends(user_in_db),
):
    return await permission.get_permissions(
        db=db, user_id=user.id, object_uid=object_uid, object_name=object_name
    )


async def grant_permission(
    grant_permissions: GrantPermission,
    db: AsyncSession = Depends(get_db),
    user: types.User = Depends(user_in_db),
):

    is_permitted = await permission.permmited(
        db=db,
        user_id=user.id,
        object_name=grant_permissions.object_name,
        object_uid=grant_permissions.object_uid,
        type=models.PermissionTypes.EDIT,
    )

    if not is_permitted:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    target_user = (
        (
            await db.execute(
                select(models.User).filter(
                    models.User.email == grant_permissions.user_email
                )
            )
        )
        .scalars()
        .first()
    )

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with mail: {grant_permissions.user_email} does not exists.",
        )

    try:
        validated_permission = models.PermissionTypes(grant_permissions.permission)

        db.add(
            models.Permission(
                type=validated_permission.value,
                object_uid=grant_permissions.object_uid,
                object_name=grant_permissions.object_name,
                user=target_user,
            )
        )
    except ValueError as err:
        logging.exception(
            f"Permission with name: {grant_permissions.permission} does not exist."
        )
