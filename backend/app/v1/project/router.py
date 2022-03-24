from sys import path
from typing import List

from fastapi import APIRouter

from app.v1.project import endpoints as project_endpoints
from app.v1.project.phase import endpoints as phase_endpoints
from app.v1.project.file_system.file import endpoints as file_endpoints
from app.v1.project.order import endpoints as order_endpoints
from app.v1.project.event import endpoints as event_endpoints
from app.v1.project.file_system.folder import endpoints as folder_endpoints
from app.v1.project.file_system import endpoints as file_system_endpoints
from app.v1.project.printing_agency import endpoints as printing_agency_endpoints

from app.v1.project.file_system.file.router import file_router
from app.v1.project.order.router import order_router


from app import path_ops

project_router = APIRouter()

project_router.include_router(router=file_router, prefix="/file", tags=["File"])

project_router.include_router(router=order_router, prefix="/order", tags=["Order"])

project_router.add_api_route(
    path="/list", endpoint=project_endpoints.list_projects, methods=["GET"]
)


project_router.add_api_route(
    path="/{project_uid}/participant",
    endpoint=project_endpoints.attach_user_to_project,
    methods=["POST"],
)


project_router.add_api_route(
    path="/{project_uid}/participant",
    endpoint=project_endpoints.detach_user_from_project,
    methods=["DELETE"],
)

project_router.add_api_route(
    path="/{project_uid}/participants",
    endpoint=project_endpoints.list_participants,
    methods=["GET"],
)


# Phases.
project_router.add_api_route(
    path="/{project_uid}/phase/list",
    endpoint=phase_endpoints.list_phases,
    methods=["GET"],
    response_model=List[phase_endpoints.ResponsePhase],
)

project_router.add_api_route(
    path="/{project_uid}/phase",
    endpoint=phase_endpoints.create_project_phase,
    methods=["POST"],
    response_model=phase_endpoints.ResponsePhase,
)

project_router.add_api_route(
    path="/{project_uid}/phase/{phase_id}",
    endpoint=phase_endpoints.update_project_phase,
    methods=["PUT"],
)

project_router.add_api_route(
    path="/{project_uid}/phase/{phase_id}",
    endpoint=phase_endpoints.delete_project_phase,
    methods=["DELETE"],
)

# Events.
project_router.add_api_route(
    path="/{project_uid}/events/list",
    endpoint=event_endpoints.paginate_events,
    methods=["GET"],
)


# Printing Agencies.
project_router.add_api_route(
    path="/{project_uid}/printing_agency",
    endpoint=printing_agency_endpoints.create_printing_agency,
    methods=["POST"],
)

project_router.add_api_route(
    path="/{project_uid}/printing_agency/list",
    endpoint=printing_agency_endpoints.list_project_printing_agencies,
    methods=["GET"],
)


# Orders.
project_router.add_api_route(
    path="/{project_uid}/order",
    endpoint=order_endpoints.create_order,
    methods=["POST"],
)

project_router.add_api_route(
    path="/{project_uid}/order/list/user",
    endpoint=order_endpoints.list_user_orders,
    methods=["GET"],
)

project_router.add_api_route(
    path="/{project_uid}/order/list",
    endpoint=order_endpoints.list_orders,
    methods=["GET"],
)


# Files.
project_router.add_api_route(
    path="/{project_uid}/file/upload",
    endpoint=file_endpoints.upload_file,
    methods=["POST"],
)

project_router.add_api_route(
    path="/{project_uid}/file/filter",
    endpoint=file_endpoints.filter_files,
    methods=["GET"],
)


project_router.add_api_route(
    path="/{project_uid}/file/objects",
    endpoint=file_endpoints.list_objects,
    methods=["GET"],
)

project_router.add_api_route(
    path="/{project_uid}/folder",
    endpoint=folder_endpoints.create_folder,
    methods=["POST"],
)


project_router.add_api_route(
    path="/{project_uid}/file_system/object/move",
    endpoint=file_system_endpoints.move_objects,
    methods=["POST"],
)

project_router.add_api_route(
    path="/{project_uid}/file_system/object/rename",
    endpoint=file_system_endpoints.rename_object,
    methods=["PUT"],
)

project_router.add_api_route(
    path="/{project_uid}/file_system/object",
    endpoint=file_system_endpoints.delete_object,
    methods=["DELETE"],
)


# Global
project_router.add_api_route(
    path="/{project_uid}/subscribe",
    endpoint=project_endpoints.subscribe,
    methods=["POST"],
)

project_router.add_api_route(
    path="/{project_uid}/superposition",
    endpoint=project_endpoints.set_superposition_config,
    methods=["POST"],
)

project_router.add_api_route(
    path="/{project_id}/group",
    endpoint=project_endpoints.create_group,
    methods=["POST"],
)

project_router.add_api_route(
    path="/{project_uid}",
    endpoint=project_endpoints.get_project,
    methods=["GET"],
    response_model=path_ops.EnrichedProject,
)

project_router.add_api_route(
    path="/{project_uid}", endpoint=project_endpoints.update_project, methods=["PUT"]
)

project_router.add_api_route(
    path="/{project_uid}",
    endpoint=project_endpoints.detach_project,
    methods=["DELETE"],
)

project_router.add_api_route(
    path="", endpoint=project_endpoints.start_project, methods=["POST"]
)
