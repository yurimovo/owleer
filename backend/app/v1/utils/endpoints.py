from fastapi import Depends, HTTPException, status, File, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession


from app import types, storage
from app.auth import user_in_db
from app.database import get_db
from app.config import get_settings

settings = get_settings()


async def upload_image(
    file: UploadFile = File(...),
    user: types.User = Depends(user_in_db),
):
    file_path = f"{user.uid}/images/"

    await run_in_threadpool(
        storage.upload_public_file,
        file_obj=file.file,
        bucket_name=settings.storage_public_bucket_name,
        file_name=file.filename,
        path=file_path,
    )

    file_uri = await run_in_threadpool(
        storage.generate_image_file_uri, file_path=file_path + file.filename
    )

    return {"file_uri": file_uri}
