from typing import Optional

from fastapi.security import HTTPBearer
from fastapi import Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import firebase_admin
from firebase_admin import auth
from firebase_admin import credentials


from app.database import get_db
from app import models, types, config


config = config.get_settings()

firebase_cred = credentials.Certificate(config.firebase_credentials)

firebase_admin.initialize_app(credential=firebase_cred)


def get_token_auth_header(request: Request):
    """Obtains the Access Token from the Authorization Header"""
    auth = request.headers.get("Authorization", None)
    if not auth:
        raise HTTPException(
            401, detail="authorization_header_missing, Authorization header is expected"
        )

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise HTTPException(
            401, detail="invalid_header, Authorization header must start with Bearer"
        )

    elif len(parts) == 1:
        raise HTTPException(401, detail="invalid_header, Token not found")

    elif len(parts) > 2:
        raise HTTPException(
            401, detail="invalid_header, Authorization header must be Bearer token"
        )

    token = parts[1]
    return token


class Auth0Bearer(HTTPBearer):
    def __init__(
        self,
        auto_error: bool = True,
    ):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        try:
            return get_token_auth_header(request)
        except Exception as e:
            if self.auto_error:
                raise e
            return None


class UserInDB:
    def __init__(self, auto_error=True) -> None:
        self.auto_error = auto_error
        super().__init__()

    async def __call__(
        self,
        token=Depends(Auth0Bearer(auto_error=False)),
        db: AsyncSession = Depends(get_db),
    ) -> Optional[models.User]:

        try:
            decoded_token = auth.verify_id_token(token)
        except firebase_admin._token_gen.ExpiredIdTokenError as err:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User authentication expired.",
            )
        except firebase_admin._auth_utils.InvalidIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Token."
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=" Illegal ID token provided.",
            )

        user: models.User = (
            (
                await db.execute(
                    select(models.User).filter_by(auth_token=decoded_token["uid"])
                )
            )
            .scalars()
            .first()
        )

        if not user and self.auto_error:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="User not in DB")

        return types.User.from_orm(user) if user else None


user_in_db = UserInDB()
