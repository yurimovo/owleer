from typing import List

from fastapi import APIRouter

from app.v1.communication.email.router import mail_router


communication_router = APIRouter()

communication_router.include_router(router=mail_router, prefix="/email", tags=["Order"])
