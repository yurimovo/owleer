from typing import List

from fastapi import APIRouter

from app.v1.communication.email import endpoints as email_endpoints


mail_router = APIRouter()

mail_router.add_api_route(
    path="/event/webhook", endpoint=email_endpoints.mail_event_webhook, methods=["POST"]
)


mail_router.add_api_route(
    path="/list", endpoint=email_endpoints.paginate_emails, methods=["GET"]
)
