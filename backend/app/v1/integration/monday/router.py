from typing import List


from fastapi import APIRouter

from app.v1.integration.monday import endpoints as integration_monday_endpoints


integration_monday_router = APIRouter()


integration_monday_router.add_api_route(
    "/profile",
    endpoint=integration_monday_endpoints.get_profile,
    methods=["GET"],
    response_model=integration_monday_endpoints.Profile,
)


integration_monday_router.add_api_route(
    "/board/list",
    endpoint=integration_monday_endpoints.get_boards,
    methods=["GET"],
    response_model=List[integration_monday_endpoints.Board],
)


integration_monday_router.add_api_route(
    "/board/{board_id}/item/list",
    endpoint=integration_monday_endpoints.list_board_items,
    methods=["GET"],
    response_model=integration_monday_endpoints.BoardItemsResponse,
)
