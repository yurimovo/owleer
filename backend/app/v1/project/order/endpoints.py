from optparse import Option
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime
from xmlrpc.client import boolean

from fastapi import Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select

from app.auth import user_in_db
from app.database import get_db
from app import models, types, tasks, path_ops, storage
from app.config import get_settings

settings = get_settings()


class OrderTypes(Enum):
    PRINT = "print"


# Models
class CustomerDetails(BaseModel):
    name: Optional[str]
    office: Optional[str]
    phone: Optional[str]
    onAccount: Optional[str]


class FileData(BaseModel):
    workType: str
    folding: str
    description: str
    copies: int
    pageSize: str


class FileOnOrder(BaseModel):
    uid: str
    data: FileData


class OrderAddress(BaseModel):
    name: str
    address: str
    description: str


class PrintingAgency(BaseModel):
    uid: Optional[str]
    name: Optional[str]


class CreateOrder(BaseModel):
    customer_details: CustomerDetails
    files: List[FileOnOrder]
    address: OrderAddress
    agency: PrintingAgency


class OrderOnList(BaseModel):
    uid: str
    approved: boolean
    customer_details: CustomerDetails
    creation_time: datetime
    files_count: int


# Fetch File Models
class FileOnFetchOrder(BaseModel):
    uid: str
    path: str
    data: Optional[Dict] = {}


class Order(BaseModel):
    uid: str
    approved: bool
    customer_details: CustomerDetails
    type: str
    files: List[FileOnFetchOrder]
    creation_time: datetime


# Endpoints
async def list_orders(
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    user: types.UserBase = Depends(user_in_db),
):

    user_project_admin = (
        (
            await db.execute(
                select(models.UserProjectAssociation).filter_by(
                    user_id=user.id, project_id=project.id, is_admin=True
                )
            )
        )
        .scalars()
        .first()
    )

    if not user_project_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    orm_orders: List[models.ProjectOrder] = (
        (
            await db.execute(
                select(models.ProjectOrder)
                .filter(models.ProjectOrder.project_id == project.id)
                .options(selectinload(models.ProjectOrder.files))
                .options(selectinload(models.ProjectOrder.customer))
            )
        )
        .scalars()
        .all()
    )

    return [
        OrderOnList(
            uid=o.uid,
            approved=o.approved,
            customer_details=CustomerDetails(
                name=(o.data.get("customer_details") or {}).get("name") or user.name,
                office=(o.data.get("customer_details") or {}).get("office")
                or user.data.get("company"),
                phone=(o.data.get("customer_details") or {}).get("phone") or user.phone,
            ),
            creation_time=o.created_at,
            files_count=len(o.files),
        )
        for o in orm_orders
    ]


async def list_user_orders(
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    user: types.UserBase = Depends(user_in_db),
):
    orm_orders: List[models.ProjectOrder] = (
        (
            await db.execute(
                select(models.ProjectOrder)
                .filter(
                    models.ProjectOrder.project_id == project.id,
                    models.ProjectOrder.customer_id == user.id,
                )
                .options(selectinload(models.ProjectOrder.files))
                .options(selectinload(models.ProjectOrder.customer))
            )
        )
        .scalars()
        .all()
    )

    return [
        OrderOnList(
            uid=o.uid,
            approved=o.approved,
            order_type=o.data.get("order_type") or "",
            customer_details=CustomerDetails(
                name=(o.data.get("customer_details") or {}).get("name") or user.name,
                office=(o.data.get("customer_details") or {}).get("office")
                or user.data.get("company"),
                phone=(o.data.get("customer_details") or {}).get("phone") or user.phone,
            ),
            creation_time=o.created_at,
            files_count=len(o.files),
        )
        for o in orm_orders
    ]


async def create_order(
    order: CreateOrder,
    project: types.Project = Depends(path_ops.get_project),
    db: AsyncSession = Depends(get_db),
    user: types.UserBase = Depends(user_in_db),
):
    new_order_uid = models.generate_uid()

    agency: List[models.ProjectPrintingAgency] = (
        (
            await db.execute(
                select(models.ProjectPrintingAgency).filter_by(uid=order.agency.uid)
            )
        )
        .scalars()
        .one()
    )

    new_order_orm = models.ProjectOrder(
        uid=new_order_uid,
        printing_agency_id=agency.id,
        customer_id=user.id,
        data=order.dict(),
        project_id=project.id,
        type=OrderTypes.PRINT.value,
    )

    db.add(new_order_orm)

    orm_files: List[models.ProjectFile] = (
        (
            await db.execute(
                select(models.ProjectFile).filter(
                    models.ProjectFile.uid.in_([f.uid for f in order.files])
                )
            )
        )
        .scalars()
        .all()
    )

    file_data_map = {f.uid: f.data.dict() for f in order.files}

    for orm_file in orm_files:
        db.add(
            models.FileOrderAssociation(
                order=new_order_orm,
                file_id=orm_file.id,
                data=file_data_map[orm_file.uid],
            )
        )

    project_admin_emails = [ua.user.email for ua in project.users if ua.is_admin]

    tasks.email.send_dynamic_template.delay(
        send_from=settings.sendgrid_sender_mail,
        send_to=project_admin_emails,
        dynamic_template_data={
            "sender_name": user.name,
            "project_name": project.name,
            "order_uid": new_order_uid,
        },
        name=f"{user.name} - {user.role}",
        template_id=settings.sendgrid_template_id_print_order_placed,
    )

    tasks.event.add_event.delay(
        initiator_id=user.id,
        project_id=project.id,
        event_type=tasks.event.EventTypes.ORDER_PLACED.value,
        event_name=f"{user.name} - {user.role} placed an order.",
        data={},
    )


async def fetch_order(
    order_uid: str,
    db: AsyncSession = Depends(get_db),
    user: types.UserBase = Depends(user_in_db),
):
    orm_order: models.ProjectOrder = (
        (
            await db.execute(
                select(models.ProjectOrder)
                .filter_by(uid=order_uid)
                .options(
                    selectinload(models.ProjectOrder.files).selectinload(
                        models.FileOrderAssociation.file
                    )
                )
            )
        )
        .scalars()
        .first()
    )

    if not orm_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    user_project_admin = (
        (
            await db.execute(
                select(models.UserProjectAssociation).filter_by(
                    user_id=user.id, project_id=orm_order.project_id, is_admin=True
                )
            )
        )
        .scalars()
        .first()
    )

    if not user.id == orm_order.customer_id and not user_project_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    return Order(
        uid=orm_order.uid,
        approved=orm_order.approved,
        customer_details=CustomerDetails(
            name=(orm_order.data.get("customer_details") or {}).get("name")
            or user.name,
            office=(orm_order.data.get("customer_details") or {}).get("office")
            or user.data.get("company"),
            phone=(orm_order.data.get("customer_details") or {}).get("phone")
            or user.phone,
        ),
        type=orm_order.type,
        files=[
            FileOnFetchOrder(
                uid=fa.file.uid,
                path=models.decode_s3_external_storage_id(fa.file.external_storage_id)[
                    "file_key"
                ],
                data=fa.data,
            )
            for fa in orm_order.files
        ],
        creation_time=orm_order.created_at,
    )


async def approve_order(
    request: Request,
    order_uid: str,
    db: AsyncSession = Depends(get_db),
    user: types.UserBase = Depends(user_in_db),
):
    orm_order: models.ProjectOrder = (
        (
            await db.execute(
                select(models.ProjectOrder)
                .filter(models.ProjectOrder.uid == order_uid)
                .options(
                    selectinload(models.ProjectOrder.files).selectinload(
                        models.FileOrderAssociation.file
                    )
                )
                .options(selectinload(models.ProjectOrder.printing_agency))
            )
        )
        .scalars()
        .first()
    )

    if not orm_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    user_project_admin = (
        (
            await db.execute(
                select(models.UserProjectAssociation)
                .filter_by(
                    user_id=user.id, project_id=orm_order.project_id, is_admin=True
                )
                .options(selectinload(models.UserProjectAssociation.project))
            )
        )
        .scalars()
        .first()
    )

    if not user_project_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    orm_order.approved = True

    # Send Mail To Supplier.
    send_to = [settings.admin_email]

    if orm_order.printing_agency:
        if orm_order.printing_agency.email:
            send_to.append(orm_order.printing_agency.email)

    order_files = [
        {
            "file_name": models.decode_s3_external_storage_id(
                id=fa.file.external_storage_id
            )["file_key"],
            "file_uri": storage.generate_file_uri(
                file_path=models.decode_s3_external_storage_id(
                    id=fa.file.external_storage_id
                )["file_key"]
            ),
            "work_type": fa.data.get("workType"),
            "folding": fa.data.get("folding"),
            "copies": fa.data.get("copies"),
            "page_size": fa.data.get("pageSize"),
            "restrictions": fa.data.get("description"),
        }
        for fa in orm_order.files
    ]

    tasks.email.send_dynamic_template.delay(
        send_from=settings.sendgrid_sender_mail,
        send_to=send_to,
        dynamic_template_data={
            "customer": {
                "project_name": user_project_admin.project.name,
                "name": (orm_order.data.get("customer_details") or {}).get("name")
                or user.name,
                "office": (orm_order.data.get("customer_details") or {}).get("office")
                or user.data.get("company"),
                "phone": (orm_order.data.get("customer_details") or {}).get("phone")
                or user.phone,
                "on_account": (orm_order.data.get("customer_details") or {}).get(
                    "onAccount"
                ),
            },
            "order": {"type": orm_order.data.get("order_type"), "files": order_files},
            "address": {
                "name": (orm_order.data.get("address") or {}).get("name"),
                "address": (orm_order.data.get("address") or {}).get("address"),
                "restrictions": (orm_order.data.get("address") or {}).get(
                    "description"
                ),
            },
        },
        name=f"{user.name} - {user.role}",
        attachments=order_files,
        template_id=settings.sendgrid_template_id_send_print_order_to_supplier,
        headers={"Authorization": request.headers.get("Authorization")},
    )
