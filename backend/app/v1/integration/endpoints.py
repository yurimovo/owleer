from typing import Dict, List, Optional
import json

from fastapi import Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.v1.integration import dependencies as integrations_dep
from app.http import get_http_client
from app import auth, models, types
from app.v1.integration.autodesk import autodesk
from app.v1.integration.monday import monday
from app.v1.integration.zoom import zoom
from app.database import get_db, redis_fast_api


class CreateIntegration(BaseModel):
    name: Optional[str]
    type: integrations_dep.IntegrationTypes
    payload: Optional[Dict] = {}
    secrets: Optional[Dict] = {}


class Integration(BaseModel):
    uid: str
    name: Optional[str]
    type: integrations_dep.IntegrationTypes
    payload: Optional[Dict]


# Endpoints.
async def create_integration(
    integration: CreateIntegration,
    user: types.User = Depends(auth.user_in_db),
    db: AsyncSession = Depends(get_db),
    redis_client=Depends(redis_fast_api.get_redis_client),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    additional_data = {}

    if integration.type == integrations_dep.IntegrationTypes.AUTODESK:
        tokens = await autodesk.fetch_tokens(
            code=integration.payload["code"], http_client=http_client
        )

        if "errorCode" in tokens:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=tokens["developerMessage"],
            )

        access_token_key = (
            f"{integrations_dep.IntegrationTypes.AUTODESK.value}_access_key_{user.id}"
        )

        await redis_client.set(
            access_token_key,
            tokens["access_token"],
            expire=tokens["expires_in"],
        )

        integration.secrets = {
            **integration.secrets,
            "refresh_token": tokens["refresh_token"],
        }

    if integration.type == integrations_dep.IntegrationTypes.MONDAY:
        tokens = await monday.fetch_tokens(
            code=integration.payload["code"], http_client=http_client
        )

        if "errorCode" in tokens:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=tokens["developerMessage"],
            )

        access_token_key = (
            f"{integrations_dep.IntegrationTypes.MONDAY.value}_access_key_{user.id}"
        )

        await redis_client.set(access_token_key, tokens["access_token"], expire=60 * 60)

    if integration.type == integrations_dep.IntegrationTypes.ZOOM:
        tokens = await zoom.fetch_tokens(
            code=integration.payload["code"], http_client=http_client
        )

        if "errorCode" in tokens:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=tokens["errorMessage"],
            )

        zoom_access_token_key = integrations_dep.generate_integration_access_cache_key(
            type=integrations_dep.IntegrationTypes.ZOOM, user_id=user.id
        )

        await redis_client.set(
            zoom_access_token_key,
            tokens["access_token"],
            expire=tokens["expires_in"],
        )

        integration.secrets = {
            **integration.secrets,
            "refresh_token": tokens["refresh_token"],
        }

        additional_data.update({"access_token": tokens["access_token"]})

    integration_uid = models.generate_uid()

    new_integration = models.Integration(
        user_id=user.id,
        type=integrations_dep.IntegrationTypes(integration.type).value,
        payload=integration.payload,
        secrets=json.dumps(integration.secrets),
        name=integration.name,
        uid=integration_uid,
    )

    db.add(new_integration)

    return {"uid": integration_uid, "additional_data": additional_data}


async def get_integration_by_uid(
    integration: types.IntegrationBase = Depends(
        integrations_dep.get_integration_by_uid
    ),
):
    return Integration(
        uid=integration.uid,
        name=integration.name,
        type=integration.type,
        payload=integration.payload,
    )


async def get_integrations_by_type(
    integrations: List[types.IntegrationBase] = Depends(
        integrations_dep.IntegrationByType
    ),
):
    return [
        Integration(uid=i.uid, name=i.name, type=i.type, payload=i.payload)
        for i in integrations
    ]
