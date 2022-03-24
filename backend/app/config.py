from functools import lru_cache

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    app_name: str = "owleer.io"

    app_secret: str = Field(..., env="APP_SECRET")

    admin_email: str = "office@owleer.io"

    app_uri: str = "https://workspace.owleer.io"

    connection_string: str = Field(..., env="DATABASE_CONNECTION_STRING")

    # Storage.
    storage_public_bucket_name: str = "owleer-public"
    projects_storage_bucket_name: str = "owleer-app-storage"

    file_service_url: str = "https://workspace.owleer.io/storage/"

    # Auth.
    firebase_credentials: dict = Field(..., env="FIREBASE_CREDENTIALS")

    # Sendgrid.
    sendgrid_api_key: str = Field(..., env="SENDGRID_API_KEY")

    sendgrid_sender_mail = "office@owleer.io"

    sendgrid_template_id_message_received = "d-f53428c00a454701b568a834bc29edab"
    sendgrid_template_id_issue_created = "d-3f5756b5e56e4c4cb8e155e48dbe38a4"
    sendgrid_template_id_comment_added_to_issue = "d-f1f902f0ddc04afca2a3e54e68ec227b"
    sendgrid_template_id_generate_report = "d-742429716f884eb094029c02e9a4fc28"
    sendgrid_template_id_send_files = "d-9ced11ea9a934bb984eaa1011e4601c2"
    sendgrid_template_id_attached_to_project = "d-7f020d9d38d147febb1bf831a414f8ef"
    sendgrid_template_id_print_order_placed = "d-99db2b81a183463987532ecc34ac415a"
    sendgrid_template_id_send_print_order_to_supplier = (
        "d-6f1aba95591d45a4b565b447dc91ad7d"
    )
    sendgrid_template_id_notify_on_event = "d-9943e34cdafe479abec950df51f45aff"

    # Redis.
    redis_host: str = Field(..., env="REDIS_HOST")
    redis_app_broker: int = 0
    redis_celery_broker: int = 1
    # Integrations.
    # Autodesk.
    autodesk_forge_client_id: str = Field(..., env="AUTODESK_FORGE_CLIENT_ID")
    autodesk_forge_client_secret: str = Field(..., env="AUTODESK_FORGE_CLIENT_SECRET")
    # Monday
    monday_client_id: str = Field(..., env="MONDAY_CLIENT_ID")
    monday_client_secret: str = Field(..., env="MONDAY_CLIENT_SENCRET")
    monday_signing_secret: str = Field(..., env="MONDAY_SIGNING_SECRET")
    # Zoom.
    zoom_client_id: str = Field(..., env="ZOOM_CLIENT_ID")
    zoom_client_secret: str = Field(..., env="ZOOM_CLIENT_SECRET")


@lru_cache()
def get_settings():
    return Settings()
