from typing import Dict, List
from enum import Enum

from app.tasks.celery import BaseTask, app
from app import models
from app.tasks import email
from app.config import get_settings


settings = get_settings()


class EventTypes(Enum):
    REPORT_GENERATED = "REPORT_GENERATED"
    FILES_UPLOADED = "FILES_UPLOADED"
    FILES_SENT = "FILES_SENT"
    ISSUE_CREATED = "ISSUE_CREATED"
    COMMENT_PLACED = "COMMENT_PLACED"
    ORDER_PLACED = "ORDER_PLACED"


@app.task(base=BaseTask)
def add_event(
    initiator_id: int, project_id: int, event_type: str, event_name: str, data: Dict
):

    add_event.db.add(
        models.ProjectEvent(
            name=event_name,
            data=data or {},
            type=event_type,
            project_id=project_id,
            initiator_id=initiator_id,
        )
    )

    initiator: models.User = (
        add_event.db.query(models.User).filter_by(id=initiator_id).first()
    )

    user_project_admins: List[models.UserProjectAssociation] = (
        add_event.db.query(models.UserProjectAssociation)
        .filter_by(project_id=project_id, is_admin=True, notify=True)
        .all()
    )

    email.send_dynamic_template.delay(
        send_from=settings.admin_email,
        send_to=[u.user.email for u in user_project_admins],
        template_id=settings.sendgrid_template_id_notify_on_event,
        name=f"{initiator.name} - {initiator.role}",
        dynamic_template_data={
            "initiator": initiator.name,
            "event": {"name": event_name, "type": event_type, "data": data},
        },
    )
