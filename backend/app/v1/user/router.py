from fastapi import APIRouter

from app.v1.user import endpoints as user_endpoints


user_router = APIRouter()

user_router.add_api_route(
    path="/search", endpoint=user_endpoints.search, methods=["GET"]
)

user_router.add_api_route(
    path="/upsert", endpoint=user_endpoints.upsert_user, methods=["POST"]
)

user_router.add_api_route(path="", endpoint=user_endpoints.get_user, methods=["GET"])
