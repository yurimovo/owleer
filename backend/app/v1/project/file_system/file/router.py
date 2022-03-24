from typing import List

from fastapi import APIRouter

from app.v1.project.file_system.file import endpoints as file_endpoints
from app.v1.project.file_system.file.page import endpoints as page_endpoints
from app.v1.project.file_system.file.issue import endpoints as issue_endpoints
from app.v1.project.file_system.file.issue.router import issue_router

file_router = APIRouter()
file_router.include_router(router=issue_router, prefix="/issue", tags=["Issue"])


file_router.add_api_route(
    path="/{file_uid}/issue/list",
    endpoint=file_endpoints.fetch_issues,
    methods=["POST"],
)


file_router.add_api_route(
    path="/{file_uid}/issue", endpoint=issue_endpoints.create_issue, methods=["POST"]
)


file_router.add_api_route(
    path="/{file_uid}/report", endpoint=file_endpoints.send_report, methods=["POST"]
)


file_router.add_api_route(
    path="/{file_uid}/version/list",
    endpoint=file_endpoints.list_file_versions,
    methods=["GET"],
    response_model=List[file_endpoints.FileVersion],
)


file_router.add_api_route(
    path="/{file_uid}/page/{page_number}",
    endpoint=page_endpoints.upsert_page_data,
    methods=["POST"],
)


file_router.add_api_route(
    path="/{file_uid}/page/{page_number}",
    endpoint=page_endpoints.fetch_page_data,
    methods=["GET"],
)


file_router.add_api_route(
    path="/{file_uid}",
    endpoint=file_endpoints.fetch_file_metadata,
    methods=["GET"],
)

file_router.add_api_route(
    path="/send", endpoint=file_endpoints.send_files, methods=["POST"]
)
