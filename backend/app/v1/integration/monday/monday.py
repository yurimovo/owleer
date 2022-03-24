import json
import httpx

from app.config import get_settings


MONDAY_API_URI = "https://api.monday.com/v2"


settings = get_settings()


class MondayObjectNotFound(Exception):
    pass


class MondayQueryError(Exception):
    pass


# Helpers.
async def query(query: str, access_token: str, http_client: httpx.AsyncClient):
    """
    Fetch user's profile data.

    Arguments:
        access_token: (string) User's access token.
        http_client: (AsyncClient) httpx async client.
    """
    r = await http_client.post(
        MONDAY_API_URI,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
        data=query,
    )

    r.raise_for_status()

    json_result = r.json()

    if "errors" in json_result:
        raise MondayQueryError(",".join([e["message"] for e in json_result["errors"]]))

    return r.json()["data"]


# Actions.
async def fetch_tokens(code: str, http_client: httpx.AsyncClient):
    """
    Fetch user's refresh tokens.

    Arguments:
        code: (string) Authorization code recieved from user authentication to monday.com.
        http_client: (AsyncClient) httpx async client.
    """
    redirect_uri = f"{settings.app_uri}/integrations/monday/callback"

    r = await http_client.post(
        f"https://auth.monday.com/oauth2/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        params={
            "client_id": settings.monday_client_id,
            "client_secret": settings.monday_client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        },
    )

    return r.json()


async def fetch_profile(access_token: str, http_client: httpx.AsyncClient):
    """
    Fetch user's profile data.

    Arguments:
        access_token: (string) User's access token.
        http_client: (AsyncClient) httpx async client.
    """
    query_response = await query(
        query='{"query": "query { me { name email photo_original id}}"}',
        access_token=access_token,
        http_client=http_client,
    )

    return query_response["me"]


async def fetch_boards(access_token: str, http_client: httpx.AsyncClient):
    """
    Fetch user's profile data.

    Arguments:
        access_token: (string) User's access token.
        http_client: (AsyncClient) httpx async client.
    """
    query_response = await query(
        query='{"query": "query { boards { id name state updated_at updates (limit: 5, page:0 ) {body created_at creator {name email photo_original}} owner { name email photo_original }}}"}',
        access_token=access_token,
        http_client=http_client,
    )

    return query_response["boards"]


async def fetch_board_items(
    board_id: int,
    access_token: str,
    http_client: httpx.AsyncClient,
):
    query_response = await query(
        query='{"query": "query { boards (ids: %s) { name  items {id name created_at column_values { text title type value additional_info }}}}"}'
        % (board_id),
        access_token=access_token,
        http_client=http_client,
    )

    if not query_response["boards"]:
        raise MondayObjectNotFound()

    return query_response["boards"][0]
