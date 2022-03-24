from typing import List


from fastapi import APIRouter

from app.v1.integration import endpoints as integration_endpoints

from app.v1.integration.autodesk.router import (
    integration_autodesk_router as autodesk_router,
)

from app.v1.integration.monday.router import (
    integration_monday_router as monday_router,
)

from app.v1.integration.zoom.router import (
    integration_zoom_router as zoom_router,
)


integration_router = APIRouter()

integration_router.include_router(router=autodesk_router, prefix="/autodesk")
integration_router.include_router(router=monday_router, prefix="/monday")
integration_router.include_router(router=zoom_router, prefix="/zoom")


integration_router.add_api_route(
    "/type",
    endpoint=integration_endpoints.get_integrations_by_type,
    methods=["GET"],
    response_model=List[integration_endpoints.Integration],
)


integration_router.add_api_route(
    "/{integration_uid}",
    endpoint=integration_endpoints.get_integration_by_uid,
    methods=["GET"],
)


integration_router.add_api_route(
    "", endpoint=integration_endpoints.create_integration, methods=["POST"]
)
