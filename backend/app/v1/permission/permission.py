from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status


from app import path_ops, models, types


async def permmited(
    db: AsyncSession,
    user_id: int,
    object_name: str,
    object_uid: str,
    type: models.PermissionTypes,
):
    """
    Get users permissions for specific resource.

    Arguments:
        db: (AsyncSession) Session with the database.
        user: (types.User) A basic user ORM model.
        object_name: (str) The name of the resource table.
        object_uid: (str) The uid of the targe resource.
        type: (PermissionTypes) The type of the permission to check.

    returns:
        Permissions List.
    """
    permission: models.Permission = (
        (
            await db.execute(
                select(models.Permission)
                .filter(models.Permission.object_uid == object_uid)
                .filter(models.Permission.object_name == object_name)
                .filter(models.Permission.user_id == user_id)
                .filter(models.Permission.type == type.value)
            )
        )
        .scalars()
        .first()
    )

    if not permission:
        return False

    return True


async def get_permissions(
    db: AsyncSession, user_id: int, object_name: str, object_uid: str
):
    """
    Get all permissions that were set for resource.

    Arguments:
        db: (AsyncSession) DB async session.
        object_name: (str) The name of the resource table.
        object_uid: (str) The uid of the targe resource.

    """
    is_permmited = await permmited(
        db=db,
        user_id=user_id,
        object_name=object_name,
        object_uid=object_uid,
        type=models.PermissionTypes.EDIT,
    )

    if not is_permmited:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    permissios: List[models.Permission] = (
        (
            (
                await db.execute(
                    select(models.Permission)
                    .filter(models.Permission.object_uid == object_uid)
                    .filter(models.Permission.object_name == object_name)
                    .options(selectinload(models.Permission.user))
                )
            )
        )
        .scalars()
        .all()
    )

    return [types.Permission.from_orm(p) for p in permissios]


# Utils.
async def is_folder_permitted_for_edit(
    db: AsyncSession, user_id: str, path: str, project: path_ops.EnrichedProject
):
    """
    Is folder permitted for edit.

    Arguments:
        db: (AsyncSession) DB async session.
        path: (str) Target folder path.
        project_id: (int) Contex project ID
    """
    if not path == "/" and not path == f"{project.uid}/":
        parent_folder_orm: models.ProjectFolder = (
            (
                await db.execute(
                    select(models.ProjectFolder)
                    .filter(models.ProjectFolder.path == path)
                    .filter(models.ProjectFolder.project_id == project.id)
                )
            )
            .scalars()
            .first()
        )

        object_uid = parent_folder_orm.uid
        object_name = models.ProjectFolder.__tablename__

        is_permmited = await permmited(
            db=db,
            user_id=user_id,
            object_name=object_name,
            object_uid=object_uid,
            type=models.PermissionTypes.EDIT,
        )

        if not is_permmited and project.is_admin:
            db.add(
                models.Permission(
                    type=models.PermissionTypes.EDIT.value,
                    user_id=user_id,
                    object_uid=object_uid,
                    object_name=object_name,
                )
            )
            return True

        return is_permmited
    else:
        return project.is_admin
