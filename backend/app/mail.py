from typing import List, Dict, Optional
from urllib.request import urlopen
import urllib.request
from enum import Enum
import sys

import base64

import httpx

from app.config import get_settings


# Const.
SENDGRID_BASE_API_URL = "https://api.sendgrid.com/v3"


class SendgridEventTypes(Enum):
    OPEN = "open"
    DELIVERED = "delivered"


# Fetch Config.
settings = get_settings()


# Helpers.
def dynamic_template_request(
    send_from: str,
    send_to: str,
    template_id: str,
    name=Optional[str],
    attachments: Optional[List[Dict]] = None,
    dynamic_template_data: Optional[Dict] = None,
    bcc: Optional[List[str]] = None,
    html: bool = False,
    headers: Optional[Dict] = {},
):
    if not attachments:
        attachments = []

    if not bcc:
        bcc = []

    if not dynamic_template_data:
        dynamic_template_data = {}

    request_url = f"{SENDGRID_BASE_API_URL}/mail/send"

    request_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.sendgrid_api_key}",
    }

    payload_attachments = []

    for atach in attachments:
        req = urllib.request.Request(atach["file_uri"])

        for key, val in headers.items():
            req.add_header(key, val)

        attach_bytes = urlopen(req).read()

        attach_size_kb = sys.getsizeof(attach_bytes) / 1000

        if attach_size_kb < 19000:  # 19 MB
            payload_attachments.append(
                {
                    "content": base64.b64encode(attach_bytes).decode("utf-8"),
                    "filename": atach["file_name"],
                }
            )

    request_payload = {
        "personalizations": [
            {
                "to": [{"email": send_to}],
                "dynamic_template_data": dynamic_template_data or {},
            }
        ],
        "from": {"email": send_from},
        "template_id": template_id,
        "attachments": payload_attachments,
    }

    if not payload_attachments:
        request_payload.pop("attachments")

    if name:
        request_payload["from"]["name"] = name

    if bcc:
        request_payload["personalizations"][0]["bcc"] = [{"email": e} for e in bcc]  # type: ignore

    if html:
        request_payload["content"][0]["type"] = "text/html"  # type: ignore

    return request_url, request_headers, request_payload


def send_mail_request(
    send_from: str,
    send_to: str,
    subject: str,
    message: str,
    name: Optional[str] = None,
    bcc: Optional[List[str]] = None,
    html=False,
):

    if not bcc:
        bcc = []

    request_url = f"{SENDGRID_BASE_API_URL}/mail/send"

    request_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.sendgrid_api_key}",
    }

    request_payload = {
        "personalizations": [{"to": [{"email": send_to}]}],
        "from": {"email": send_from},
        "subject": subject,
        "content": [{"type": "text/plain", "value": message}],
    }

    if name:
        request_payload["from"]["name"] = name

    if bcc:
        request_payload["personalizations"][0]["bcc"] = [{"email": e} for e in bcc]

    if html:
        request_payload["content"][0]["type"] = "text/html"

    return request_url, request_headers, request_payload


# Mail Functions.
async def send_mail(
    send_from: str,
    send_to: str,
    subject: str,
    message: str,
    http_client: httpx.AsyncClient,
    name: Optional[str],
    bcc: Optional[List[str]] = None,
    html=False,
):
    """
    Send mail message.

    Arguments:
        send_from (string): Sender mail address.
        send_to (string): Recipient mail address.
        subject (string): Mail subject.
        message (string): Mail message content.

    Returns:
        True on success. (Bool)
    """
    request_url, request_headers, request_payload = send_mail_request(
        send_from=send_from,
        send_to=send_to,
        subject=subject,
        message=message,
        name=name,
        bcc=bcc,
        html=html,
    )

    response = await http_client.post(
        request_url, headers=request_headers, json=request_payload
    )

    response.raise_for_status()

    return True


async def send_mail_sync(
    send_from: str,
    send_to: str,
    subject: str,
    message: str,
    name: Optional[str],
    bcc: Optional[List[str]] = None,
    html=False,
):
    """
    Send mail message.

    Arguments:
        send_from (string): Sender mail address.
        send_to (string): Recipient mail address.
        subject (string): Mail subject.
        message (string): Mail message content.

    Returns:
        True on success. (Bool)
    """
    request_url, request_headers, request_payload = send_mail_request(
        send_from=send_from,
        send_to=send_to,
        subject=subject,
        message=message,
        name=name,
        bcc=bcc,
        html=html,
    )

    response = httpx.post(request_url, headers=request_headers, json=request_payload)

    response.raise_for_status()

    return True


async def send_dynamic_template(
    send_from: str,
    send_to: str,
    template_id: str,
    http_client: httpx.AsyncClient,
    dynamic_template_data: Optional[Dict] = None,
    attachments: Optional[List[Dict]] = None,
    bcc: Optional[List[str]] = None,
    html: bool = False,
):
    """
    Send mail from template.

    Arguments:
        send_from (string): Sender mail address.
        send_to (string): Recipient mail address.
        subject (string): Mail subject.
        message (string): Mail message content.

    Returns:
        True on success. (Bool)
    """
    if not attachments:
        attachments = []

    request_url, request_headers, request_payload = dynamic_template_request(
        send_from=send_from,
        send_to=send_to,
        template_id=template_id,
        dynamic_template_data=dynamic_template_data,
        attachments=attachments,
        bcc=bcc,
        html=html,
    )

    response = await http_client.post(
        request_url, headers=request_headers, json=request_payload
    )

    response.raise_for_status()

    return True


def send_dynamic_template_sync(
    send_from: str,
    send_to: str,
    template_id: str,
    name: Optional[str],
    dynamic_template_data: Optional[Dict] = None,
    attachments: Optional[List[Dict]] = None,
    bcc: Optional[List[str]] = None,
    html: bool = False,
    headers: Optional[Dict] = {},
):
    """
    Send mail from template.

    Arguments:
        send_from (string): Sender mail address.
        send_to (string): Recipient mail address.
        subject (string): Mail subject.
        message (string): Mail message content.

    Returns:
        True on success. (Bool)
    """
    if not attachments:
        attachments = []

    request_url, request_headers, request_payload = dynamic_template_request(
        send_from=send_from,
        send_to=send_to,
        template_id=template_id,
        dynamic_template_data=dynamic_template_data,
        attachments=attachments,
        name=name,
        bcc=bcc,
        html=html,
        headers=headers,
    )

    response = httpx.post(
        request_url, headers=request_headers, json=request_payload, timeout=360
    )

    response.raise_for_status()

    message_id = response.headers.get("x-message-id")

    return message_id
