from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.v1.router import v1_router
from app.database import redis_fast_api
from app.config import get_settings

settings = get_settings()


def create_fa_app():
    app = FastAPI()

    @app.on_event("startup")
    async def startup():
        await redis_fast_api.init_app(app, settings)

    app.include_router(v1_router, prefix="/api")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app
