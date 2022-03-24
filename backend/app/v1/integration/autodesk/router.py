from typing import List


from fastapi import APIRouter

from app.v1.integration.autodesk import endpoints as integration_autodesk_endpoints


integration_autodesk_router = APIRouter()


integration_autodesk_router.add_api_route(
    "/profile", endpoint=integration_autodesk_endpoints.get_profile, methods=["GET"]
)

integration_autodesk_router.add_api_route(
    "/projects/{project_id}/folder/{folder_urn}/contents",
    endpoint=integration_autodesk_endpoints.fetch_folder_contents,
    methods=["GET"],
)

integration_autodesk_router.add_api_route(
    "/projects", endpoint=integration_autodesk_endpoints.get_projects, methods=["GET"]
)
