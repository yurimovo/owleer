from enum import Enum
from typing import Dict, Optional, List

from fastapi import Depends, HTTPException, status
from fastapi.security import http
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import httpx

from app import auth, models, types
from app.database import get_db


class IntegrationTypes(Enum):
    AUTODESK = "autodesk"
    MONDAY = "monday"
    ZOOM = "zoom"


# Helpers.
def generate_integration_access_cache_key(type: IntegrationTypes, user_id: int):
    """
    Generate Redis cache access key for integration.

    Arguments:
        type: (IntegrationTypes) Integration type.
        user_id: (int) User ID.
    """
    return f"{type.value}_access_key_{user_id}"


# Dependencies.
async def get_integration_by_uid(
    integration_uid: str,
    user=Depends(auth.user_in_db),
    db: AsyncSession = Depends(get_db),
):

    integration: models.Integration = (
        (await db.execute(select(models.Integration).filter_by(uid=integration_uid)))
        .scalars()
        .first()
    )

    if not integration:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Integration with ID: {integration_uid}, is not exist.",
        )

    if integration.user_id is not user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User is not authorized to access project with uid: {integration_uid}",
        )

    return types.IntegrationBase.from_orm(integration)


class IntegrationByType:
    def __init__(self, type: IntegrationTypes):
        self.type = type

    async def __call__(
        self,
        user=Depends(auth.user_in_db),
        db: AsyncSession = Depends(get_db),
    ) -> List[types.IntegrationBase]:
        integrations: models.Integration = (
            (
                await db.execute(
                    select(models.Integration).filter_by(
                        type=self.type.value, user_id=user.id
                    )
                )
            )
            .scalars()
            .all()
        )

        return [types.IntegrationBase.from_orm(i) for i in integrations]
