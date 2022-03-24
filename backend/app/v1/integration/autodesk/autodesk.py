import httpx

from app.config import get_settings


settings = get_settings()


async def fetch_tokens(code: str, http_client: httpx.AsyncClient):
    """
    Fetch user's refresh tokens.

    Arguments:
        code: (string) Authorization code recieved from user authentication to autodesk.
        http_client: (AsyncClient) httpx async client.
    """
    r = await http_client.post(
        "https://developer.api.autodesk.com/authentication/v1/gettoken",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "client_id": settings.autodesk_forge_client_id,
            "client_secret": settings.autodesk_forge_client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": f"{settings.app_uri}/integrations/autodesk/callback",
        },
    )

    return r.json()


async def fetch_access_token(refresh_token: str, http_client: httpx.AsyncClient):
    """
    Fetch user's access tokens.

    Arguments:
        refresh_token: (string) Autodesk refresh token.
        http_client: (AsyncClient) httpx async client.
    """
    r = await http_client.post(
        "https://developer.api.autodesk.com/authentication/v1/refreshtoken",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "client_id": settings.autodesk_forge_client_id,
            "client_secret": settings.autodesk_forge_client_secret,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
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
        "https://developer.api.autodesk.com/userprofile/v1/users/@me",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    r.raise_for_status()

    return r.json()


async def get_hub_ids(access_token: str, http_client: httpx.AsyncClient):
    """
    Fetch user's BIM 360 hub IDs.

    Arguments:
        refresh_token: (string) Autodesk refresh token.
        http_client: (AsyncClient) httpx async client.
    """
    r = await http_client.get(
        "https://developer.api.autodesk.com/project/v1/hubs",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    r.raise_for_status()

    json_response = r.json()

    hub_ids = [h["id"] for h in json_response["data"]]

    await get_hub_projects(
        access_token=access_token, http_client=http_client, hub_id=hub_ids[0]
    )

    return hub_ids


async def get_hub_projects(
    hub_id: str, access_token: str, http_client: httpx.AsyncClient
):
    """
    Fetch user's BIM 360 hub IDs.

    Arguments:
        refresh_token: (string) Autodesk refresh token.
        http_client: (AsyncClient) httpx async client.
    """
    r = await http_client.get(
        f"https://developer.api.autodesk.com/project/v1/hubs/{hub_id}/projects",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    r.raise_for_status()

    return r.json()["data"]


async def fetch_folder_contents(
    project_id: str, folder_urn: str, access_token: str, http_client: httpx.AsyncClient
):
    """
    Fetch te content of a specific folder.

    Arguments:
        refresh_token: (string) Autodesk refresh token.
        http_client: (AsyncClient) httpx async client.
    """
    r = await http_client.get(
        f"https://developer.api.autodesk.com/data/v1/projects/{project_id}/folders/{folder_urn}/contents",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    r.raise_for_status()

    return r.json()["data"]
