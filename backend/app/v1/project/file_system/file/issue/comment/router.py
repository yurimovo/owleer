from fastapi import APIRouter

from app.v1.project.file_system.file.issue.comment import endpoints as comment_endpoints

comment_router = APIRouter()


comment_router.add_api_route(
    path="/{comment_uid}", endpoint=comment_endpoints.update_comment, methods=["PUT"]
)


comment_router.add_api_route(
    path="/{comment_uid}", endpoint=comment_endpoints.delete_comment, methods=["DELETE"]
)
