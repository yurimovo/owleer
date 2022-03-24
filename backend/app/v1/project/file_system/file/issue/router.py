from fastapi import APIRouter

from app.v1.project.file_system.file.issue import endpoints as issue_endpoints
from app.v1.project.file_system.file.issue.comment import endpoints as comment_endpoints
from app.v1.project.file_system.file.issue.comment.router import comment_router

issue_router = APIRouter()
issue_router.include_router(router=comment_router, prefix="/comment", tags=["Comment"])


issue_router.add_api_route(
    path="/{issue_uid}/comment/list",
    endpoint=issue_endpoints.fetch_comments,
    methods=["GET"],
)

issue_router.add_api_route(
    path="/{issue_uid}/comment",
    endpoint=comment_endpoints.create_comment,
    methods=["POST"],
)

issue_router.add_api_route(
    path="/{issue_uid}", endpoint=issue_endpoints.get_issue, methods=["GET"]
)

issue_router.add_api_route(
    path="/{issue_uid}", endpoint=issue_endpoints.update_issue, methods=["PUT"]
)

issue_router.add_api_route(
    path="/{issue_uid}", endpoint=issue_endpoints.delete_issue, methods=["DELETE"]
)
