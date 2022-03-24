from fastapi import APIRouter
from app.v1.permission import endpoints as permission_endpoints


permission_router = APIRouter()


permission_router.add_api_route(
    path="/list", endpoint=permission_endpoints.get_permissions, methods=["GET"]
)


permission_router.add_api_route(
    path="/grant", endpoint=permission_endpoints.grant_permission, methods=["POST"]
)


permission_router.add_api_route(
    path="/{permission_uid}",
    endpoint=permission_endpoints.delete_permission,
    methods=["DELETE"],
)
