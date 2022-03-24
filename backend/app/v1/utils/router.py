from fastapi import APIRouter

from app.v1.utils import endpoints as utils_endpoints

utils_router = APIRouter()


utils_router.add_api_route(
    path="/upload_image", endpoint=utils_endpoints.upload_image, methods=["POST"]
)
