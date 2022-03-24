from typing import List
import json

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.http import get_http_client
from app.http import get_http_client
from app.v1.integration import dependencies
from app.database import get_db, redis_fast_api
from app.auth import user_in_db
from app import types


async def generate_monday_access_token(
    user: types.User = Depends(user_in_db),
    redis_client=Depends(redis_fast_api.get_redis_client),
    integrations: List[types.IntegrationBase] = Depends(
        dependencies.IntegrationByType(type=dependencies.IntegrationTypes.MONDAY)
    ),
):
    access_token_key = (
        f"{dependencies.IntegrationTypes.MONDAY.value}_access_key_{user.id}"
    )

    cached_access_token = await redis_client.get(access_token_key)

    if cached_access_token:
        return cached_access_token.decode("utf-8")

    if not integrations:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Autodesk Integration is not setup.",
        )

    secrets = json.loads(integrations[0].secrets)
    access_token = secrets["access_token"]

    return access_token
