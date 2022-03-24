from copyreg import constructor
from typing import List
import logging


from fastapi import Depends, Request
from pydantic import BaseModel
import httpx

from app.http import get_http_client
from app.v1.integration.zoom import dependencies
from app.v1.integration.zoom import zoom as zoom_service
from app.config import get_settings
from app import tasks


settings = get_settings()


class recurrenceType(BaseModel):
    type: str


class newMeetingData(BaseModel):
    agenda: str
    topic: str
    duration: str
    recurrence: recurrenceType
    password: str
    start_time: str
    timezone: str


class meetingId(BaseModel):
    meeting_id: str


class sendInviteLink(BaseModel):
    invite_link: str
    emails: List[str]


async def get_profile(
    access_token=Depends(dependencies.generate_zoom_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    profile = await zoom_service.get_profile(
        access_token=access_token, http_client=http_client
    )

    return profile


async def meetings_list(
    access_token=Depends(dependencies.generate_zoom_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    list = await zoom_service.meetings_list(
        access_token=access_token, http_client=http_client
    )

    return list


async def create_meeting(
    new_meeting_data: newMeetingData,
    access_token=Depends(dependencies.generate_zoom_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    new_meeting = await zoom_service.create_meeting(
        access_token=access_token,
        http_client=http_client,
        new_meeting_data=new_meeting_data,
    )

    return new_meeting


async def delete_meeting(
    meeting_id: str,
    access_token=Depends(dependencies.generate_zoom_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    r = await zoom_service.delete_meeting(
        access_token=access_token, http_client=http_client, meeting_id=meeting_id
    )

    return r


async def send_invite_meeting_link(
    invite: sendInviteLink,
    request: Request,
):
    tasks.email.send_dynamic_template.delay(
        headers={"Authorization": request.headers.get("Authorization")},
        send_from=settings.sendgrid_sender_mail,
        invite_link=invite.join_link,
        send_to=invite.emails,
        dynamic_template_data={
            "message": "send_files.message",
        },
        template_id=settings.sendgrid_template_id_send_files,
    )


async def deauthorization_webhook(request: Request):
    data = await request.json()
    logging.info(data)


async def events_webhook(request: Request):
    data = await request.json()
    logging.info(data)
