from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

import aioredis

from app.config import get_settings


def create_db_engine():
    return create_engine(settings.connection_string, max_overflow=2, pool_timeout=60, pool_size=3, pool_pre_ping=True)  # type: ignore


def create_async_db_engine():
    return create_async_engine(
        settings.connection_string.replace("postgresql://", "postgresql+asyncpg://")  # type: ignore
    )


# Fetch Config.
settings = get_settings()


# Init DB Connections.
db_engine = create_db_engine()
adb_engine = create_async_db_engine()


_session_local = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)


def get_sync_db():
    db: Session = _session_local()
    try:
        yield db
        db.commit()
    except:
        db.rollback()
        raise
    finally:
        db.close()


async def get_db():
    async with AsyncSession(adb_engine) as session:
        async with session.begin():
            yield session

        await session.commit()


class RedisFastApiClient:
    redis_client = None

    async def init_app(self, app, config):
        self.redis_client = await aioredis.create_redis_pool(
            f"redis://{settings.redis_host}:6379/{settings.redis_app_broker}"
        )

    def get_redis_client(self):
        if not self.redis_client:
            raise Exception("Redis not initalized")
        return self.redis_client


redis_fast_api = RedisFastApiClient()
