from typing import Optional, Dict, List
import datetime


from app.tasks.celery import BaseTask, app
from app import mail, models


@app.task(base=BaseTask)
def send_dynamic_template(
    send_from: str,
    send_to: List[str],
    template_id: str,
    name: Optional[str],
    dynamic_template_data: Optional[Dict] = None,
    attachments: Optional[List[Dict]] = None,
    bcc: Optional[List[str]] = None,
    html: bool = False,
    headers: Optional[Dict] = {},
    sender_user_id: Optional[int] = None,
    mail_name: Optional[str] = "",
):
    if not attachments:
        attachments = []

    for s_email in send_to:
        message_id = mail.send_dynamic_template_sync(
            headers=headers,
            send_from=send_from,
            send_to=s_email,
            template_id=template_id,
            dynamic_template_data=dynamic_template_data,
            attachments=attachments,
            name=name,
            bcc=bcc,
            html=html,
        )

        handle_sent_message.delay(
            subject=mail_name,
            message_id=message_id,
            sender_user_id=sender_user_id,
            recipient_email=s_email,
        )


@app.task(base=BaseTask)
def send_mail(
    send_from: str,
    send_to: List[str],
    subject: str,
    message: str,
    name: Optional[str],
    bcc: Optional[List[str]] = None,
    html=False,
):
    for s_email in send_to:
        mail.send_mail_sync(
            send_from=send_from,
            send_to=s_email,
            subject=subject,
            message=message,
            name=name,
            bcc=bcc,
            html=html,
        )


@app.task(base=BaseTask)
def handle_sent_message(
    subject: str, message_id: str, sender_user_id: Optional[int], recipient_email: str
):

    recipient_user = (
        handle_sent_message.db.query(models.User)
        .filter_by(email=recipient_email)
        .first()
    )

    if recipient_user:
        orm_message = models.MailMessage(
            subject=subject,
            sender_id=sender_user_id,
            recipient_id=recipient_user.id,
            external_message_id=message_id,
        )
        handle_sent_message.db.add(orm_message)


@app.task(base=BaseTask)
def handle_event(event: dict):
    message_id = event.get("sg_message_id")

    if message_id:
        external_message_id = message_id.split(".")[0]
        orm_message = (
            handle_event.db.query(models.MailMessage)
            .filter_by(external_message_id=external_message_id)
            .first()
        )
        if orm_message:

            if (
                mail.SendgridEventTypes(event.get("event"))
                == mail.SendgridEventTypes.OPEN
            ):
                orm_message.opened = True
                orm_message.opening_time = datetime.datetime.fromtimestamp(
                    event.get("timestamp")
                )

            if (
                mail.SendgridEventTypes(event.get("event"))
                == mail.SendgridEventTypes.DELIVERED
            ):
                orm_message.delivered = True
                orm_message.delivery_time = datetime.datetime.fromtimestamp(
                    event.get("timestamp")
                )

            handle_event.db.add(orm_message)
