from typing import List
import json

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx

from app.http import get_http_client
from app.v1.integration.zoom import zoom
from app.v1.integration import dependencies
from app.database import get_db, redis_fast_api
from app.auth import user_in_db
from app import types, models


async def generate_zoom_access_token(
    user: types.User = Depends(user_in_db),
    redis_client=Depends(redis_fast_api.get_redis_client),
    integrations: List[types.IntegrationBase] = Depends(
        dependencies.IntegrationByType(type=dependencies.IntegrationTypes.ZOOM)
    ),
    http_client: httpx.AsyncClient = Depends(get_http_client),
    db: AsyncSession = Depends(get_db),
):
    zoom_access_token_key = dependencies.generate_integration_access_cache_key(
        type=dependencies.IntegrationTypes.ZOOM, user_id=user.id
    )

    cached_access_token = await redis_client.get(zoom_access_token_key)

    if cached_access_token:
        return cached_access_token.decode("utf-8")

    if not integrations:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Zoom Integration is not setup.",
        )

    secrets = json.loads(integrations[0].secrets)
    refresh_token = secrets["refresh_token"]

    tokens = await zoom.fetch_access_token(
        refresh_token=refresh_token, http_client=http_client
    )

    orm_integration: models.Integration = (
        (
            await db.execute(
                select(models.Integration).filter_by(uid=integrations[0].uid)
            )
        )
        .scalars()
        .first()
    )

    orm_integration.secrets = json.dumps(
        {
            **json.loads(integrations[0].secrets),
            "refresh_token": tokens["refresh_token"],
        }
    )

    await redis_client.set(
        zoom_access_token_key, tokens["access_token"], expire=tokens["expires_in"]
    )

    return tokens["access_token"]
