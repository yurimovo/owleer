from celery import Celery, Task

from app.config import get_settings
from app.database import get_sync_db

settings = get_settings()


app = Celery(
    "tasks", broker=f"redis://{settings.redis_host}:6379/{settings.redis_celery_broker}"
)


class BaseTask(Task):
    def __init__(self):
        self.db = next(get_sync_db())  # type: ignore

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        self.db.rollback()

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        if status.lower() != "failed":
            self.db.commit()
        self.db.close()
