from fastapi import Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession

from app import path_ops, storage, models
from app.v1.permission import permission
from app.database import get_db
from app.auth import user_in_db
from app.config import get_settings

settings = get_settings()


async def create_folder(
    folder_name: str,
    project: path_ops.EnrichedProject = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    user=Depends(user_in_db),
    path: str = "/",
):
    if path == "/":
        path = f"{project.uid}/"

    if not await permission.is_folder_permitted_for_edit(
        db=db, user_id=user.id, path=path, project=project
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    new_folder_uid = models.generate_uid()

    db.add(
        models.Permission(
            user_id=user.id,
            type=models.PermissionTypes.EDIT.value,
            object_name=models.ProjectFolder.__tablename__,
            object_uid=new_folder_uid,
        )
    )

    await run_in_threadpool(
        storage.create_folder,
        bucket_name=settings.projects_storage_bucket_name,
        folder_name=folder_name,
        path=path,
    )

    new_folder_path = folder_name + "/" if path == "/" else path + folder_name + "/"

    db.add(
        models.ProjectFolder(
            project_id=project.id,
            user_id=user.id,
            path=new_folder_path,
            uid=new_folder_uid,
        )
    )
