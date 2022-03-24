from datetime import datetime
import json
from typing import Optional, List

from fastapi import Request, Depends
from pydantic import BaseModel

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.future import select
from sqlalchemy import func

from app.database import get_db
from app.auth import user_in_db
from app import tasks, types, models

# Models.
class MailEvent(BaseModel):
    email: Optional[str]
    event: Optional[str]
    sg_event_id: Optional[str]
    sg_message_id: Optional[str]
    sg_template_id: Optional[str]
    sg_template_name: Optional[str]
    timestamp: Optional[int]


class EmailRecipient(BaseModel):
    name: str
    email: str


class Email(BaseModel):
    uid: str
    subject: Optional[str]
    recipient: EmailRecipient
    created_at: datetime
    delivered: bool
    delivery_date: Optional[datetime]
    opened: bool
    open_date: Optional[datetime]


# Endpoints.
async def mail_event_webhook(request: Request):
    events_list = json.loads((await request.body()).decode("utf-8"))
    for event in events_list:
        event_obj = MailEvent.parse_obj(event)
        tasks.email.handle_event.delay(event_obj.dict())


async def paginate_emails(
    page: int = 0,
    size: int = 100,
    db: AsyncSession = Depends(get_db),
    user: types.UserBase = Depends(user_in_db),
):
    base_quey = (
        select(models.MailMessage)
        .order_by(models.MailMessage.created_at.desc())
        .filter(models.MailMessage.sender_id == user.id)
    )

    total: int = (
        (await db.execute(select(func.count()).select_from(base_quey)))
    ).scalar_one()

    mails: List[models.MailMessage] = (
        ((await db.execute(base_quey.offset(size * page).limit(size)))).scalars().all()
    )

    result = []

    for m in mails:
        recipient: models.User = (
            ((await db.execute(select(models.User).filter_by(id=m.recipient_id))))
            .scalars()
            .one()
        )

        result.append(
            Email(
                uid=m.uid,
                subject=m.subject,
                recipient=EmailRecipient(name=recipient.name, email=recipient.email),
                created_at=m.created_at,
                delivered=m.delivered,
                delivery_date=m.delivery_time,
                opened=m.opened,
                open_date=m.opening_time,
            )
        )

    return {"emails": result, "total": total}
