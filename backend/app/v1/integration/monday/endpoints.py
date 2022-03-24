from datetime import datetime
from typing import Optional, List, Dict
import json

from fastapi import Depends, HTTPException, status
from pydantic import BaseModel
import httpx

from app.v1.integration.monday import dependencies, monday
from app.http import get_http_client


class Profile(BaseModel):
    name: str
    email: str
    photo: Optional[str]


class BoardUpdate(BaseModel):
    body: str
    created_at: datetime
    creator: Profile


class Board(BaseModel):
    id: int
    name: str
    state: str
    updated_at: datetime
    updates: List[BoardUpdate]
    owner: Profile


class BoardItemColumnAdditionalData(BaseModel):
    label: Optional[str]
    color: Optional[str]
    changed_at: Optional[datetime]


class BoardItemColumn(BaseModel):
    text: Optional[str]
    title: Optional[str]
    type: Optional[str]
    additional_info: Optional[BoardItemColumnAdditionalData] = {}


class BoardItem(BaseModel):
    id: int
    name: str
    created_at: str
    colums: List[BoardItemColumn]


class BoardItemsResponse(BaseModel):
    board_name: str
    items: List[BoardItem]
    columns: List[str]


async def get_profile(
    access_token=Depends(dependencies.generate_monday_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    try:
        profile = await monday.fetch_profile(
            access_token=access_token, http_client=http_client
        )
    except monday.MondayQueryError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    return Profile(
        name=profile["name"], email=profile["email"], photo=profile["photo_original"]
    )


async def get_boards(
    access_token=Depends(dependencies.generate_monday_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    try:
        boards = await monday.fetch_boards(
            access_token=access_token, http_client=http_client
        )
    except monday.MondayQueryError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    return [
        Board(
            id=b["id"],
            name=b["name"],
            state=b["state"],
            updated_at=b["updated_at"],
            updates=[
                BoardUpdate(
                    body=u["body"],
                    creator=Profile(
                        name=u["creator"]["name"],
                        email=u["creator"]["name"],
                        photo=u["creator"]["photo_original"],
                    ),
                    created_at=u["created_at"],
                )
                for u in b.get("updates") or []
            ],
            owner=Profile(
                name=b["owner"]["name"],
                email=b["owner"]["name"],
                photo=b["owner"]["photo_original"],
            ),
        )
        for b in boards
    ]


async def list_board_items(
    board_id: int,
    access_token=Depends(dependencies.generate_monday_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    try:
        response = await monday.fetch_board_items(
            board_id=board_id,
            access_token=access_token,
            http_client=http_client,
        )
    except monday.MondayObjectNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    except monday.MondayQueryError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

    items = response["items"]

    columns = []

    if items:
        columns = [cv["title"] for cv in items[0]["column_values"] or []]

    item_models = [
        BoardItem(
            id=i["id"],
            name=i["name"],
            created_at=i["created_at"],
            colums=[
                BoardItemColumn(
                    text=cv["text"],
                    type=cv["type"],
                    title=cv["title"],
                    additional_info=json.loads(cv["additional_info"] or "{}"),
                )
                for cv in i["column_values"] or []
            ],
        )
        for i in items
    ]

    return BoardItemsResponse(
        board_name=response["name"], items=item_models, columns=columns
    )
