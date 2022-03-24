from typing import List, Dict, Optional
import logging

from pydantic import BaseModel
from fastapi import Depends, Response, status, HTTPException
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select

import pycountry
from sqlalchemy.sql.functions import mode
from app.v1.project import dependencies as projects_dep

from app.v1.project.phase import endpoints as phase_endpoints
from app.auth import user_in_db
from app.database import get_db
from app import models, types, storage, path_ops, tasks
from app.config import get_settings

settings = get_settings()

# Models.
# Base.
class Participant(BaseModel):
    email: str
    name: Optional[str] = ""
    phone: Optional[str] = ""


class UserRole(BaseModel):
    email: Optional[str]
    name: Optional[str]
    phone: Optional[str]
    role: Optional[str]


class CompanyRole(BaseModel):
    uid: str
    name: Optional[str]
    role: Optional[str]


class ProjectGroup(BaseModel):
    users: Optional[List[UserRole]] = []
    companies: Optional[List[CompanyRole]] = []


class ProjectGroups(BaseModel):
    management: ProjectGroup
    engineering: ProjectGroup
    field: ProjectGroup


class InitiatorCompany(BaseModel):
    name: Optional[str]
    uid: str


class Project(BaseModel):
    name: str
    type: str
    description: Optional[str]
    country: str
    city: str
    floors_above_level: Optional[int] = 0
    floors_behind_level: Optional[int] = -1
    site_size: Optional[float] = 0
    groups: ProjectGroups
    data: Optional[Dict] = {}
    phases: Optional[List[phase_endpoints.ProjectPhase]] = []


class Company(BaseModel):
    uid: str
    name: str
    image_url: Optional[str]


# Request Models.
# Subscribe.
class SubscribeProject(BaseModel):
    subscribe: bool


# CreateProject.
class CreateProject(Project):
    initiatorCompany: InitiatorCompany


class CreateGroup(BaseModel):
    name: str


class ProjectStats(BaseModel):
    new_files_count: Optional[int] = 0


# Update Project.
class UpdateProject(BaseModel):
    name: Optional[str]
    status: Optional[str]
    data: Optional[Dict] = {}


# Response Models.
class ProjectInList(BaseModel):
    uid: str
    name: str
    type: Optional[str]
    status: Optional[str] = ""
    is_admin: bool
    description: Optional[str]
    data: Optional[Dict] = {}
    stats: Optional[ProjectStats] = {}


# Edit Superposition.
class SuperpositionConfig(BaseModel):
    fileId: Optional[str]


# Endpoints.


# Deprecated
# async def create_project(
#     project_data: CreateProject,
#     response: Response,
#     user: types.UserBase = Depends(user_in_db),
#     db: AsyncSession = Depends(get_db),
# ):
#     # if not user.paying:
#     #     raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED)

#     project = models.Project(
#         name=project_data.name,
#         description=project_data.description,
#         type=project_data.type,
#         country=pycountry.countries.get(name=project_data.country).name,
#         city=project_data.city,
#         floors_above_level=project_data.floors_above_level,
#         floors_behind_level=project_data.floors_behind_level,
#         site_size=project_data.site_size,
#         data=project_data.data.__dict__,
#     )

#     # Add current user as admin.
#     project.users.append(
#         models.UserProjectAssociation(
#             user_id=user.id,
#             is_admin=True,
#         )
#     )

#     # Set Andmin Company.
#     try:
#         owner_company: models.Company = (
#             await db.execute(
#                 select(models.Company).filter_by(uid=project_data.initiatorCompany.uid)
#             )
#         ).scalar_one()

#         project.companies.append(
#             models.CompanyProjectAssociation(company_id=owner_company.id, is_admin=True)
#         )
#     except Exception as err:
#         logging.exception(err)
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST, detail="Wrong owner company UID."
#         )

#     # Add project participants.
#     # Add groups to project.
#     for group_name, group in project_data.groups.dict().items():
#         orm_group = models.ProjectGroup(name=group_name)

#         # Add roles to group.
#         for user_r in group["users"]:
#             orm_role = models.ProjectGroupRoles(name=user_r.get("role"))

#             # Set role participants.
#             user: models.User = (
#                 await db.execute(
#                     select(models.User).filter_by(email=user_r.get("email"))
#                 )
#             ).scalar()

#             ## TODO: Send invite email.

#             if not user:
#                 ## TODO: Send invite email.
#                 user: models.User = models.User(
#                     email=user_r.get("email"),
#                     phone=user_r.get("phone"),
#                     name=user_r.get("name"),
#                     role=user_r.get("role"),
#                 )

#             orm_role.users.append(user)

#             project.users.append(
#                 models.UserProjectAssociation(user=user, additional_user_data=user_r)
#             )

#             orm_group.roles.append(orm_role)

#         # Set role company.
#         for company_r in group["companies"]:
#             orm_role = models.ProjectGroupRoles(name=company_r.get("role"))
#             try:
#                 company: models.Company = (
#                     await db.execute(
#                         select(models.Company).filter_by(uid=company_r.get("uid"))
#                     )
#                 ).scalar_one()
#                 orm_role.company_id = company.id
#                 project.companies.append(
#                     models.CompanyProjectAssociation(company=company)
#                 )
#                 orm_group.roles.append(orm_role)
#             except Exception as err:
#                 logging.exception(err)

#         db.add(orm_group)

#     # Set Phases.
#     for phase in project_data.phases:
#         project.phases.append(models.ProjectPhase(name=phase.name, data=phase.data))

#     project.uid = models.generate_uid()

#     await run_in_threadpool(storage.create_bucket, bucket_name=project.uid)

#     db.add(project)

#     response.status_code = status.HTTP_201_CREATED
#     return


class StartProject(BaseModel):
    name: str
    country: str
    initiator_organization_uid: str
    data: Optional[Dict] = {}


async def start_project(
    start_project: StartProject,
    user: types.UserBase = Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    # if not user.paying:
    #     raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED)

    new_project_uid = models.generate_uid()

    new_project_orm: models.Project = models.Project(
        uid=new_project_uid,
        name=start_project.name,
        country=pycountry.countries.get(name=start_project.country).name,
        data=start_project.data,
    )

    # Add current user as admin.
    new_project_orm.users.append(
        models.UserProjectAssociation(
            user_id=user.id,
            is_admin=True,
        )
    )

    # Set Andmin Company.
    try:
        owner_company: models.Company = (
            await db.execute(
                select(models.Company).filter_by(
                    uid=start_project.initiator_organization_uid
                )
            )
        ).scalar_one()

        db.add(
            models.CompanyProjectAssociation(
                project=new_project_orm, company_id=owner_company.id, is_admin=True
            )
        )

    except Exception as err:
        logging.exception(err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Wrong owner company UID."
        )

    new_project_orm.uid = models.generate_uid()

    await run_in_threadpool(
        storage.create_folder,
        bucket_name=settings.projects_storage_bucket_name,
        folder_name=new_project_orm.uid,
    )

    db.add(new_project_orm)


async def get_project(
    project: types.Project = Depends(path_ops.get_project),
):
    return project


async def detach_project(
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    user: types.UserBase = Depends(user_in_db),
):

    admin_user_association = next(
        (ua for ua in project.users if ua.user.id == user.id and ua.is_admin), None
    )

    if not admin_user_association:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to edit project.",
        )

    orm_project: models.Project = (
        (
            await db.execute(
                select(models.Project)
                .filter_by(uid=project.uid)
                .options(
                    selectinload(models.Project.users).selectinload(
                        models.UserProjectAssociation.user
                    )
                )
            )
        )
        .scalars()
        .first()
    )

    for ua in orm_project.users:
        await db.delete(ua)


async def list_projects(
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
    projects_stats=Depends(projects_dep.fetch_projects_stats_last_week),
):

    result = {}

    user_projects_associations: List[models.UserProjectAssociation] = (
        (
            await db.execute(
                select(models.UserProjectAssociation)
                .filter_by(user_id=user.id)
                .options(selectinload(models.UserProjectAssociation.project))
            )
        )
        .scalars()
        .all()
    )

    users_associations_set = list(
        set([association for association in user_projects_associations])
    )

    for ua in users_associations_set:
        p_model = ProjectInList(
            uid=ua.project.uid,
            name=ua.project.name,
            type=ua.project.type,
            status=ua.project.status,
            description=ua.project.description,
            is_admin=ua.is_admin,
            data=ua.project.data or {},
            stats=projects_stats.get(ua.project.id) or {},
        )

        owner_company_association = (
            (
                await db.execute(
                    select(models.CompanyProjectAssociation)
                    .filter_by(project_id=ua.project.id, is_admin=True)
                    .options(selectinload(models.CompanyProjectAssociation.company))
                )
            )
            .scalars()
            .first()
        )

        no_company_key = (
            owner_company_association.company.uid if owner_company_association else "👷"
        )

        if result.get(no_company_key):
            result[no_company_key]["projects"].append(p_model)
        else:
            result[no_company_key] = {
                "projects": [p_model],
                "company_name": owner_company_association.company.name
                if owner_company_association
                else "",
                "company_image_url": owner_company_association.company.image_url
                if owner_company_association
                else None,
            }

    return [{"uid": uid, **data} for uid, data in result.items()]


async def set_superposition_config(
    superposition_config: SuperpositionConfig,
    project: types.Project = Depends(path_ops.get_project),
    user=Depends(user_in_db),
    db: AsyncSession = Depends(get_db),
):
    orm_project: models.Project = (
        (
            await db.execute(
                select(models.Project)
                .filter_by(uid=project.uid)
                .options(
                    selectinload(models.Project.users).selectinload(
                        models.UserProjectAssociation.user
                    )
                )
            )
        )
        .scalars()
        .first()
    )

    admin_user_association = next(
        (ua for ua in project.users if ua.user.id == user.id and ua.is_admin), None
    )

    if not admin_user_association:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to edit project.",
        )

    orm_project.data = {
        **(orm_project.data or {}),
        **{"superposition": superposition_config.dict()},
    }


async def create_group(
    group: CreateGroup,
    user=Depends(user_in_db),
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
):

    admin_user_association = next(
        (ua for ua in project.users if ua.user.id == user.id and ua.is_admin), None
    )

    if not admin_user_association:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to edit project.",
        )

    group_uid = models.generate_uid()
    db.add(models.ProjectGroup(name=group.name, uid=group_uid, project_id=project.id))

    return {"uid": group_uid}


async def attach_user_to_project(
    email: str,
    user=Depends(user_in_db),
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
):
    admin_user_association = next(
        (ua for ua in project.users if ua.user.id == user.id and ua.is_admin), None
    )

    if not admin_user_association:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to edit project.",
        )

    orm_user_to_attach = (
        (await db.execute(select(models.User).filter_by(email=email))).scalars().first()
    )

    if not orm_user_to_attach:
        orm_user_to_attach = models.User(email=email)
        ## TODO: Send invintation mail.

    tasks.email.send_dynamic_template.delay(
        send_from=settings.sendgrid_sender_mail,
        send_to=[email],
        dynamic_template_data={
            "sender_name": user.name,
            "project_name": project.name,
        },
        name=f"{user.name} - {user.role}",
        template_id=settings.sendgrid_template_id_attached_to_project,
    )
    db.add(
        models.UserProjectAssociation(user=orm_user_to_attach, project_id=project.id)
    )


async def detach_user_from_project(
    email: str,
    user=Depends(user_in_db),
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
):

    admin_user_association = next(
        (ua for ua in project.users if ua.user.id == user.id and ua.is_admin), None
    )

    if not admin_user_association:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to edit project.",
        )

    orm_user_to_detach = (
        (await db.execute(select(models.User).filter_by(email=email))).scalars().first()
    )

    if not orm_user_to_detach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    user_project_assosiations = (
        (
            await db.execute(
                select(models.UserProjectAssociation).filter_by(
                    user_id=orm_user_to_detach.id, project_id=project.id
                )
            )
        )
        .scalars()
        .all()
    )

    if not user_project_assosiations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User is not on the project."
        )

    for ua in user_project_assosiations:
        await db.delete(ua)


async def list_participants(
    user=Depends(user_in_db),
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
):
    return [{"name": ua.user.name, "email": ua.user.email} for ua in project.users]


async def update_project(
    update_data: UpdateProject,
    user=Depends(user_in_db),
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
):
    admin_user_association = next(
        (ua for ua in project.users if ua.user.id == user.id and ua.is_admin), None
    )

    if not admin_user_association:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to edit project.",
        )

    orm_project: models.Project = (
        (await db.execute(select(models.Project).filter_by(uid=project.uid)))
        .scalars()
        .first()
    )

    orm_project.data = {**(orm_project.data or {}), **(update_data.data or {})}

    orm_project.status = update_data.status or orm_project.status

    orm_project.name = update_data.name or orm_project.name


async def subscribe(
    subscribe: SubscribeProject,
    user=Depends(user_in_db),
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
):
    admin_user_association: models.UserProjectAssociation = next(
        (ua for ua in project.users if ua.user.id == user.id and ua.is_admin), None
    )

    if not admin_user_association:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not allowed to edit project.",
        )

    user_project_assosiations_orm = (
        (
            await db.execute(
                select(models.UserProjectAssociation).filter_by(
                    user_id=user.id, project_id=project.id
                )
            )
        )
        .scalars()
        .first()
    )

    if not user_project_assosiations_orm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            details="User is not associated with the project.",
        )

    user_project_assosiations_orm.subscribe = subscribe.subscribe
