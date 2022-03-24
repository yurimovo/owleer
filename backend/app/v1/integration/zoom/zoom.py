import base64
from re import S
from typing import List
from fastapi import Depends, Request


import httpx
from pydantic import Json

from app.config import get_settings
from app import tasks


settings = get_settings()


async def fetch_tokens(code: str, http_client: httpx.AsyncClient):
    """
    Fetch user's refresh tokens.

    Arguments:
        code: (string) Authorization code recieved from user authentication to autodesk.
        http_client: (AsyncClient) httpx async client.
    """
    encoded_secrets = base64.b64encode(
        f"{settings.zoom_client_id}:{settings.zoom_client_secret}".encode("utf-8")
    ).decode("utf-8")

    redirect_uri = f"{settings.app_uri}/integrations/zoom"

    r = await http_client.post(
        f"https://zoom.us/oauth/token?code={code}&grant_type=authorization_code&redirect_uri={redirect_uri}",
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {encoded_secrets}",
        },
    )

    r.raise_for_status()

    return r.json()


async def fetch_access_token(refresh_token: str, http_client: httpx.AsyncClient):
    """
    Fetch user's access tokens.

    Arguments:
        refresh_token: (string) Autodesk refresh token.
        http_client: (AsyncClient) httpx async client.
    """
    encoded_secrets = base64.b64encode(
        f"{settings.zoom_client_id}:{settings.zoom_client_secret}".encode("utf-8")
    ).decode("utf-8")

    redirect_uri = f"{settings.app_uri}"

    r = await http_client.post(
        f"https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token={refresh_token}",
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {encoded_secrets}",
        },
    )

    r.raise_for_status()

    return r.json()


async def get_profile(access_token: str, http_client: httpx.AsyncClient):
    """
    Fetched Logged user's BIM360 profile.

    Arguments:
        refresh_token: (string) Autodesk refresh token.
        http_client: (AsyncClient) httpx async client.
    """
    r = await http_client.get(
        "https://api.zoom.us/v2/users/me?login_type=1",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    r.raise_for_status()

    return r.json()


async def meetings_list(access_token: str, http_client: httpx.AsyncClient):
    r = await http_client.get(
        "https://api.zoom.us/v2/users/me/meetings",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    r.raise_for_status()

    return r.json()


async def create_meeting(
    access_token: str, http_client: httpx.AsyncClient, new_meeting_data
):
    print(new_meeting_data)
    r = await http_client.post(
        "https://api.zoom.us/v2/users/me/meetings",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json={
            "agenda": new_meeting_data.agenda,
            "topic": new_meeting_data.topic,
            "duration": new_meeting_data.duration,
            "password": new_meeting_data.password,
            "recurrence": {"type": new_meeting_data.recurrence.type},
            "start_time": new_meeting_data.start_time,
            "timezone": new_meeting_data.timezone,
        },
    )

    r.raise_for_status()

    return r.json()


async def delete_meeting(
    access_token: str, http_client: httpx.AsyncClient, meeting_id: str
):
    r = await http_client.delete(
        f"https://api.zoom.us/v2/meetings/{meeting_id}",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    r.raise_for_status()

    return r.raise_for_status()
