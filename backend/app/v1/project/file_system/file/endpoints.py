from datetime import datetime
from typing import Optional, List, Dict

from fastapi import Depends, HTTPException, status, File, UploadFile, Request, Form
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy import func, subquery

from pydantic import BaseModel
from botocore.exceptions import ClientError

from app import path_ops, storage, models, types, tasks
from app.v1.permission import permission
from app.v1.project.file_system.file import dependencies as file_dep
from app.database import get_db
from app.auth import user_in_db
from app.config import get_settings

settings = get_settings()

# Models.
class BucketFile(BaseModel):
    name: str
    last_modified: datetime
    content_type: str
    uri: Optional[str]
    data: Optional[Dict] = {}


class FileData(BaseModel):
    lines: Optional[Dict] = {}


# Helpers.
def extract_name_from_key(key: str):
    """
    Extract pure name from given object key.

    Arguments:
        key: (str) The given key.

    Returns:
        clean name (str).
    """
    if key and key[-1] == "/":
        return key.split("/")[-2]
    elif key:
        return key.split("/")[-1]
    return key


# Endpoints.
async def list_objects(
    user=Depends(user_in_db),
    project=Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    path="/",
):
    bucket_objects = await run_in_threadpool(
        storage.list_bucket_objects,
        bucket_name=settings.projects_storage_bucket_name,
        prefix=f"{project.uid}/" if path == "/" else f"{path}",
    )

    result = {
        "files": [
            {
                "Name": extract_name_from_key(key=f.get("Key", "")),
                "external_storage_id": models.encode_s3_external_storage_id(
                    bucket_name=settings.projects_storage_bucket_name,
                    file_key=f["Key"],
                    etag=f["ETag"],
                ),
                **f,
            }
            for f in bucket_objects.get("Contents") or []
            if f["Key"][-1] != "/"
        ],
        "directories": [
            {"key": p["Prefix"], "name": extract_name_from_key(key=p["Prefix"])}
            for p in bucket_objects.get("CommonPrefixes") or []
        ],
    }
    count_versions_query = (
        select(
            models.ProjectFileVersion.file_id, func.count(models.ProjectFileVersion.id)
        ).group_by(models.ProjectFileVersion.file_id)
    ).subquery()

    orm_files: List[models.ProjectFile] = (
        await db.execute(
            select(models.ProjectFile, count_versions_query)
            .outerjoin(
                count_versions_query,
                count_versions_query.c.file_id == models.ProjectFile.id,
            )
            .filter(
                models.ProjectFile.external_storage_id.in_(
                    [f["external_storage_id"] for f in result["files"]]
                )
            )
            .options(
                selectinload(models.ProjectFile.project)
                .selectinload(models.Project.users)
                .selectinload(models.UserProjectAssociation.user)
            )
        )
    ).all()

    orm_files_external_ids = [fo[0].external_storage_id for fo in orm_files]

    for f_obj in result["files"]:
        if f_obj["external_storage_id"] not in orm_files_external_ids:
            file_uid = models.generate_uid()
            f_obj["uid"] = file_uid

            orm_file: models.ProjectFile = models.ProjectFile(
                project_id=project.id,
                external_storage_id=f_obj["external_storage_id"],
                description="",
                uid=file_uid,
            )

            db.add(orm_file)
        else:
            orm_file_data = next(
                (
                    x
                    for x in orm_files
                    if x[0].external_storage_id == f_obj["external_storage_id"]
                ),
                None,
            )
            orm_file = orm_file_data[0]

            f_obj["uid"] = orm_file.uid
            f_obj["versions_count"] = orm_file_data[2] or 0

        f_obj["description"] = orm_file.description

        f_obj["uri"] = await run_in_threadpool(
            storage.generate_file_uri, file_path=f_obj["Key"]
        )

        if orm_file.user:
            f_obj["user"] = {
                "name": orm_file.user.name,
                "role": orm_file.user.role,
                "uid": orm_file.user.uid,
                "email": orm_file.user.email,
            }
        else:
            f_obj["user"] = {}

    orm_folders: List[models.ProjectFolder] = (
        (
            await db.execute(
                select(models.ProjectFolder)
                .filter(models.ProjectFolder.project_id == project.id)
                .filter(
                    models.ProjectFolder.path.in_(
                        [f["key"] for f in result["directories"]]
                    )
                )
                .options(
                    selectinload(models.ProjectFolder.project)
                    .selectinload(models.Project.users)
                    .selectinload(models.UserProjectAssociation.user)
                )
            )
        )
        .scalars()
        .all()
    )

    orm_folders_paths = [f.path for f in orm_folders]

    for folder in result["directories"]:
        if folder["key"] not in orm_folders_paths:
            folder_uid = models.generate_uid()
            folder["uid"] = folder_uid

            db.add(
                models.ProjectFolder(
                    project_id=project.id,
                    path=folder["key"],
                    uid=folder_uid,
                )
            )
        else:
            orm_folder = next(
                (x for x in orm_folders if x.path == folder["key"]),
                None,
            )
            folder["uid"] = orm_folder.uid

    is_permitted_to_edit = await permission.is_folder_permitted_for_edit(
        db=db, user_id=user.id, path=path, project=project
    )

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

    return {
        "result": result,
        "permitted_to_edit": is_permitted_to_edit,
        "folder_uid": parent_folder_orm.uid if parent_folder_orm else None,
    }


async def fetch_file_metadata(file_: types.ProjectFile = Depends(file_dep.get_file)):
    file_data = models.decode_s3_external_storage_id(file_.external_storage_id)

    try:
        file_obj = await run_in_threadpool(
            storage.get_bucket_object,
            bucket_name=settings.projects_storage_bucket_name,
            key=file_data["file_key"],
        )
    except ClientError as ex:
        if ex.response["Error"]["Code"] == "NoSuchKey":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    file_uri = await run_in_threadpool(
        storage.generate_file_uri, file_path=file_data["file_key"]
    )

    return BucketFile(
        name=file_data["file_key"],
        last_modified=file_obj["LastModified"],
        content_type=file_obj["ContentType"],
        uri=file_uri,
        data=file_.data,
    )


class FileVersionUser(BaseModel):
    uid: Optional[str]
    name: Optional[str]
    role: Optional[str]
    email: Optional[str]


class FileVersion(BaseModel):
    uid: str
    external_id: str
    description: Optional[str]
    created_at: datetime
    user: Optional[FileVersionUser] = {}
    data: Optional[Dict] = {}


async def list_file_versions(
    file_: types.ProjectFile = Depends(file_dep.get_file),
    db: AsyncSession = Depends(get_db),
):
    orm_versions: models.ProjectFileVersion = (
        (
            await db.execute(
                select(models.ProjectFileVersion)
                .filter(models.ProjectFileVersion.file_id == file_.id)
                .options(selectinload(models.ProjectFileVersion.user))
            )
        )
        .scalars()
        .all()
    )

    return [
        FileVersion(
            uid=v.uid,
            external_id=v.external_version_id,
            description=v.description,
            created_at=v.created_at,
            user=FileVersionUser(
                uid=v.user.uid, name=v.user.name, role=v.user.role, email=v.user.email
            )
            if v.user
            else {},
            data=v.data,
        )
        for v in orm_versions
    ]


async def upload_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    project=Depends(path_ops.get_project),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
    path: str = "/",
):
    if path == "/":
        path = f"{project.uid}/"

    is_permitted_upload = await permission.is_folder_permitted_for_edit(
        db=db, user_id=user.id, path=path, project=project
    )

    if not is_permitted_upload:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    file_key = path + file.filename if path != "/" else file.filename

    try:
        existing_file_obj = await run_in_threadpool(
            storage.get_bucket_object,
            bucket_name=settings.projects_storage_bucket_name,
            key=path + file.filename,
        )
    except ClientError as ex:
        if ex.response["Error"]["Code"] == "NoSuchKey":
            existing_file_obj = None

    file_obj = await run_in_threadpool(
        storage.upload_file,
        file_obj=file.file,
        bucket_name=settings.projects_storage_bucket_name,
        file_name=file.filename,
        path=path,
    )

    if existing_file_obj:
        external_id = models.encode_s3_external_storage_id(
            bucket_name=settings.projects_storage_bucket_name,
            file_key=path + file.filename,
            etag=existing_file_obj["ETag"],
        )

        orm_file: models.ProjectFile = (
            (
                await db.execute(
                    select(models.ProjectFile).filter(
                        models.ProjectFile.external_storage_id == external_id
                    )
                )
            )
            .scalars()
            .first()
        )

        orm_file.external_storage_id = models.encode_s3_external_storage_id(
            bucket_name=settings.projects_storage_bucket_name,
            file_key=path + file.filename,
            etag=file_obj["ETag"],
        )

        orm_file.description = description

        orm_file.user_id = user.id
    else:
        new_file_uid = models.generate_uid()

        orm_file = models.ProjectFile(
            project_id=project.id,
            external_storage_id=models.encode_s3_external_storage_id(
                bucket_name=settings.projects_storage_bucket_name,
                file_key=file_key,
                etag=file_obj["ETag"],
            ),
            uid=new_file_uid,
            user_id=user.id,
            description=description,
        )

        db.add(orm_file)

    db.add(
        models.ProjectFileVersion(
            external_version_id=file_obj["VersionId"],
            file=orm_file,
            description=description,
            user_id=user.id,
        )
    )

    splitted_file_key = file_key.split("/")

    if len(splitted_file_key) > 2:  # File is in folder.
        parent_folder_path = "/".join(splitted_file_key[:-1]) + "/"

        folder_orm: models.ProjectFolder = (
            (
                await db.execute(
                    select(models.ProjectFolder)
                    .filter(models.ProjectFolder.path == parent_folder_path)
                    .filter(models.ProjectFolder.project_id == project.id)
                )
            )
            .scalars()
            .first()
        )

        if not folder_orm:
            new_folder_uid = models.generate_uid()

            db.add(
                models.ProjectFolder(
                    path=parent_folder_path, project_id=project.id, uid=new_folder_uid
                )
            )

            db.add(
                models.Permission(
                    object_uid=new_folder_uid,
                    object_name=models.ProjectFolder.__tablename__,
                    type=models.PermissionTypes.EDIT.value,
                    user_id=user.id,
                )
            )

    return {"file_name": file.filename, "uid": orm_file.uid}


async def fetch_issues(
    issues: List[types.ProjectFileIssueBase] = Depends(file_dep.fetch_issues),
) -> List[types.ProjectFileIssueBase]:
    return issues


class SendReport(BaseModel):
    recipients_mails: List[str]


async def send_report(
    send_report: SendReport,
    user: types.UserBase = Depends(user_in_db),
    file_: types.ProjectFile = Depends(file_dep.get_file),
    db: AsyncSession = Depends(get_db),
):
    file_data = models.decode_s3_external_storage_id(file_.external_storage_id)

    issues: List[models.ProjectFileIssue] = (
        (
            await db.execute(
                select(models.ProjectFileIssue)
                .filter(models.ProjectFileIssue.file_id == file_.id)
                .options(
                    selectinload(models.ProjectFileIssue.comments).selectinload(
                        models.ProjectFileIssueComment.user
                    )
                )
            )
        )
        .scalars()
        .all()
    )

    subscribed_admins = [
        ua
        for ua in file_.project.users
        if ua.is_admin
        and ua.subscribe
        and ua.user.email not in send_report.recipients_mails
    ]

    send_report.recipients_mails.extend([ua.user.email for ua in subscribed_admins])

    tasks.email.send_dynamic_template.delay(
        send_from=settings.sendgrid_sender_mail,
        send_to=send_report.recipients_mails,
        template_id=settings.sendgrid_template_id_generate_report,
        name=f"{user.name} - {user.role}",
        dynamic_template_data={
            "sender": user.name,
            "file_uid": file_.uid,
            "file_name": file_data["file_key"].replace(file_.project.uid, ""),
            "issues": [
                {
                    "name": i.name,
                    "created_at": str(i.created_at),
                    "description": i.description,
                    "comments": [
                        {
                            "sender": c.user.name,
                            "created_at": str(c.created_at),
                            "text": c.text,
                        }
                        for c in i.comments
                    ],
                }
                for i in issues
            ],
        },
        sender_user_id=user.id,
        mail_name=f"Issues Report For {file_data['file_key']} By {user.id}",
    )

    tasks.event.add_event.delay(
        initiator_id=user.id,
        project_id=file_.project.id,
        event_type=tasks.event.EventTypes.REPORT_GENERATED.value,
        event_name=f"{user.name} - {user.role} generated report.",
        data={"file_uid": file_.uid},
    )


class FileSent(BaseModel):
    file_name: Optional[str]
    uid: str


class SendFiles(BaseModel):
    files: List[FileSent]
    emails: List[str]
    message: Optional[str] = ""


async def send_files(
    request: Request,
    send_files: SendFiles,
    user: types.UserBase = Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    orm_files: List[models.ProjectFile] = (
        (
            await db.execute(
                select(models.ProjectFile)
                .filter(models.ProjectFile.uid.in_([f.uid for f in send_files.files]))
                .options(
                    selectinload(models.ProjectFile.project)
                    .selectinload(models.Project.users)
                    .selectinload(models.UserProjectAssociation.user)
                )
            )
        )
        .scalars()
        .all()
    )

    if orm_files:
        attachments = []
        project_name = orm_files[0].project.name
        project_id = orm_files[0].project.id
        subscribed_admins = [
            u
            for u in orm_files[0].project.users
            if u.is_admin and u.subscribe and u.user.email not in send_files.emails
        ]

        for f in orm_files:
            file_metadata = models.decode_s3_external_storage_id(f.external_storage_id)
            file_uri = await run_in_threadpool(
                storage.generate_file_uri, file_path=file_metadata["file_key"]
            )
            attachments.append(
                {
                    "file_uri": file_uri,
                    "file_name": file_metadata["file_key"].replace(
                        orm_files[0].project.uid, ""
                    ),
                }
            )

        send_files.emails.extend([u.user.email for u in subscribed_admins])

        tasks.email.send_dynamic_template.delay(
            headers={"Authorization": request.headers.get("Authorization")},
            send_from=settings.sendgrid_sender_mail,
            send_to=send_files.emails,
            dynamic_template_data={
                "sender_name": user.name,
                "project_name": project_name,
                "files": attachments,
                "message": send_files.message,
            },
            name=f"{user.name} - {user.role}",
            template_id=settings.sendgrid_template_id_send_files,
            attachments=attachments,
            sender_user_id=user.id,
            mail_name=f"{user.name} - {user.role} Sent You Files From Project { project_name }",
        )

        tasks.event.add_event.delay(
            initiator_id=user.id,
            project_id=project_id,
            event_type=tasks.event.EventTypes.FILES_SENT.value,
            event_name=f"{user.name} - {user.role}, uploaded files and sent them to {','.join(send_files.emails)}",
            data={
                "send_to": send_files.emails,
                "files": [f.dict() for f in send_files.files],
                "message": send_files.message,
            },
        )


async def filter_files(
    user=Depends(user_in_db),
    project=Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    from_date: datetime = Depends(path_ops.DateTimeGenerator),
    till_date: datetime = Depends(path_ops.DateTimeGenerator()),
):
    orm_files = (
        (
            await db.execute(
                select(models.ProjectFile)
                .filter(models.ProjectFile.created_at >= from_date())
                .filter(models.ProjectFile.created_at <= till_date)
                .filter(models.ProjectFile.project_id == project.id)
                .order_by(models.ProjectFile.created_at.desc())
                .options(selectinload(models.ProjectFile.user))
            )
        )
        .scalars()
        .all()
    )

    result = []

    for f in orm_files:
        file_data = models.decode_s3_external_storage_id(f.external_storage_id)
        file_owner = {}
        if f.user:
            file_owner = {
                "name": f.user.name if f.user else None,
                "role": f.user.role if f.user else None,
                "uid": f.user.uid if f.user else None,
                "email": f.user.email if f.user else None,
            }
        result.append(
            {
                "Name": file_data["file_key"],
                "uid": f.uid,
                "description": f.description,
                "uri": storage.generate_file_uri(file_path=file_data["file_key"]),
                "created_at": f.created_at,
                "user": file_owner,
            }
        )

    return result
