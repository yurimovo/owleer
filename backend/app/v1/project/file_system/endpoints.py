from typing import List, Optional

from fastapi import Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from pydantic import BaseModel
import botocore

from app import storage, path_ops, models
from app.auth import user_in_db
from app.database import get_db
from app.v1.permission import permission
from app.config import get_settings

settings = get_settings()

# Models.
class Object(BaseModel):
    path: str
    uid: str


class MoveObjects(BaseModel):
    target_directory: str
    objects: List[Object]


# Helpers.
async def handle_rename_file_orm(
    db: AsyncSession, project_uid: str, file_uid: str, new_path: str
):
    """
    Handle file object rename in orm, keep issues.

    Arguments:
        db: (AsyncSession) Context DB async session.
        project_uid: (string) Project orm object UID.
        file_uid: (string) Target file orm object UID.
        new_path: (string) New file path.
    """
    file_orm: models.ProjectFile = (
        (
            await db.execute(
                select(models.ProjectFile)
                .filter(models.ProjectFile.uid == file_uid)
                .options(selectinload(models.ProjectFile.versions))
            )
        )
        .scalars()
        .first()
    )

    new_obj = await run_in_threadpool(
        storage.get_bucket_object,
        bucket_name=settings.projects_storage_bucket_name,
        key=new_path,
    )

    file_orm.external_storage_id = models.encode_s3_external_storage_id(
        settings.projects_storage_bucket_name, new_path, new_obj["ETag"]
    )

    for v in file_orm.versions:
        v.data = (v.data or {}).update({"file_id": v.file_id})
        v.file_id = None


async def handle_rename_folder_orm(
    db: AsyncSession, project_id: str, old_folder_path: str, new_folder_path: str
):
    """
    Handle folder object rename in orm, keep permissions.

    Arguments:
        db: (AsyncSession) Context DB async session.
        project_id: (string) Folder project ID as it in the DB.
        old_folder_path: (string) Old folder path.
        new_folder_path: (string) New folder path.
    """
    old_orm_folder: models.ProjectFolder = (
        (
            await db.execute(
                select(models.ProjectFolder)
                .filter(models.ProjectFolder.project_id == project_id)
                .filter(models.ProjectFolder.path == old_folder_path)
            )
        )
        .scalars()
        .first()
    )

    if old_orm_folder:
        old_folder_uid = old_orm_folder.uid

        await db.delete(old_orm_folder)

        permissions: List[models.Permission] = (
            (
                await db.execute(
                    select(models.Permission).filter(
                        models.Permission.object_uid == old_folder_uid
                    )
                )
            )
            .scalars()
            .all()
        )

        new_folder_uid = models.generate_uid()
        new_orm_folder = models.ProjectFolder(
            uid=new_folder_uid, path=new_folder_path, project_id=project_id
        )
        db.add(new_orm_folder)

        for per in permissions:
            per.object_uid = new_folder_uid


async def handle_rename_object(
    db: AsyncSession, old_path: str, new_path: str, project_id: str, object_uid: str
):
    # If Folder
    if old_path[-1] == "/":
        await handle_rename_folder_orm(
            db=db,
            project_id=project_id,
            old_folder_path=old_path,
            new_folder_path=new_path,
        )

        bucket_obj = await run_in_threadpool(
            storage.get_bucket, bucket_name=settings.projects_storage_bucket_name
        )

        for obj in bucket_obj.objects.filter(Prefix=old_path):
            if obj.key[-1] != "/":
                file_orm: models.ProjectFile = (
                    (
                        await db.execute(
                            select(models.ProjectFile)
                            .filter(
                                models.ProjectFile.external_storage_id
                                == models.encode_s3_external_storage_id(
                                    settings.projects_storage_bucket_name,
                                    obj.key,
                                    obj.e_tag,
                                )
                            )
                            .options(selectinload(models.ProjectFile.versions))
                        )
                    )
                    .scalars()
                    .first()
                )

                new_obj = await run_in_threadpool(
                    storage.change_object_prefix,
                    obj=obj,
                    bucket_name=settings.projects_storage_bucket_name,
                    old_prefix=old_path,
                    new_prefix=new_path,
                )

                file_orm.external_storage_id = models.encode_s3_external_storage_id(
                    settings.projects_storage_bucket_name, new_obj.key, new_obj.e_tag
                )

                for v in file_orm.versions:
                    v.data = (v.data or {}).update({"file_id": v.file_id})
                    v.file_id = None
            else:
                new_obj = await run_in_threadpool(
                    storage.change_object_prefix,
                    obj=obj,
                    bucket_name=settings.projects_storage_bucket_name,
                    old_prefix=old_path,
                    new_prefix=new_path,
                )

                await handle_rename_folder_orm(
                    db=db,
                    project_id=project_id,
                    old_folder_path=obj.key,
                    new_folder_path=new_obj.key,
                )

    # If File.
    else:
        await run_in_threadpool(
            storage.rename_object,
            bucket_name=settings.projects_storage_bucket_name,
            old_path=old_path,
            new_path=new_path,
        )

        if object_uid:
            await handle_rename_file_orm(
                db=db,
                project_uid=settings.projects_storage_bucket_name,
                file_uid=object_uid,
                new_path=new_path,
            )


# Endpoints.
async def delete_object(
    project_uid: str,
    path: str,
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
    project=Depends(path_ops.get_project),
):

    object_folder_path = "/".join(path.split("/")[:-1]) + "/" or "/"

    is_permitted = await permission.is_folder_permitted_for_edit(
        db=db, user_id=user.id, path=object_folder_path, project=project
    )

    if not is_permitted:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    if path[-1] == "/":
        # Folder.
        bucket = await run_in_threadpool(
            storage.get_bucket, bucket_name=settings.projects_storage_bucket_name
        )
        bucket.object_versions.filter(Prefix=path).delete()

        orm_folder: models.ProjectFolder = (
            (
                await db.execute(
                    select(models.ProjectFolder)
                    .filter(models.ProjectFolder.project_id == project.id)
                    .filter(models.ProjectFolder.path == path)
                )
            )
            .scalars()
            .first()
        )

        if orm_folder:
            await db.delete(orm_folder)
    else:
        # File.
        try:
            bucket_object = await run_in_threadpool(
                storage.get_bucket_object,
                bucket_name=settings.projects_storage_bucket_name,
                key=path,
            )
        except botocore.errorfactory.NoSuchKey:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        await run_in_threadpool(
            storage.delete_object,
            key=path,
            bucket_name=settings.projects_storage_bucket_name,
        )

        file_external_id = models.encode_s3_external_storage_id(
            bucket_name=settings.projects_storage_bucket_name,
            file_key=path,
            etag=bucket_object["ETag"],
        )

        orm_file: models.ProjectFolder = (
            (
                await db.execute(
                    select(models.ProjectFile).filter(
                        models.ProjectFile.external_storage_id == file_external_id
                    )
                )
            )
            .scalars()
            .first()
        )

        if orm_file:
            await db.delete(orm_file)


async def rename_object(
    path: str,
    new_name: str,
    object_uid: Optional[str],
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
    project=Depends(path_ops.get_project),
):
    object_folder_path = (
        "/".join(path.split("/")[: (-2 if path[-1] == "/" else -1)]) + "/" or ""
    )

    is_permitted = await permission.is_folder_permitted_for_edit(
        db=db, user_id=user.id, path=object_folder_path, project=project
    )

    if not is_permitted:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    new_path = (
        (
            object_folder_path
            if object_folder_path != "/" and len(object_folder_path.split("/")) > 1
            else ""
        )
        + new_name
        + ("/" if path[-1] == "/" else "")
    )

    await handle_rename_object(
        db=db,
        old_path=path,
        new_path=new_path,
        project_id=project.id,
        object_uid=object_uid,
    )


async def move_objects(
    move_data: MoveObjects,
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
    project=Depends(path_ops.get_project),
):

    for obj in move_data.objects:

        object_folder_path = (
            "/".join(obj.path.split("/")[: (-2 if obj.path[-1] == "/" else -1)]) + "/"
            or ""
        )

        is_permitted = await permission.is_folder_permitted_for_edit(
            db=db, user_id=user.id, path=object_folder_path, project=project
        )

        if not is_permitted:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

        object_name = (obj.path.split("/")[-2 if obj.path[-1] == "/" else -1]) + (
            "/" if obj.path[-1] == "/" else ""
        )

        await handle_rename_object(
            db=db,
            old_path=obj.path,
            new_path=move_data.target_directory + object_name,
            project_id=project.id,
            object_uid=obj.uid,
        )
