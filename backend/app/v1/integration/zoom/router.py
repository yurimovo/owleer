from fastapi import APIRouter

from app.v1.integration.zoom import endpoints as integration_zoom_endpoints


integration_zoom_router = APIRouter()

integration_zoom_router.add_api_route(
    "/webhook/deauthorization",
    endpoint=integration_zoom_endpoints.deauthorization_webhook,
    methods=["POST"],
)

integration_zoom_router.add_api_route(
    "/webhook/events",
    endpoint=integration_zoom_endpoints.events_webhook,
    methods=["POST"],
)


integration_zoom_router.add_api_route(
    "/profile", endpoint=integration_zoom_endpoints.get_profile, methods=["GET"]
)

integration_zoom_router.add_api_route(
    "/meeting/list", endpoint=integration_zoom_endpoints.meetings_list, methods=["GET"]
)

integration_zoom_router.add_api_route(
    "/meeting/{meeting_id}",
    endpoint=integration_zoom_endpoints.delete_meeting,
    methods=["DELETE"],
)

integration_zoom_router.add_api_route(
    "/meeting", endpoint=integration_zoom_endpoints.create_meeting, methods=["POST"]
)


integration_zoom_router.add_api_route(
    "/send/invite_links",
    endpoint=integration_zoom_endpoints.send_invite_meeting_link,
    methods=["POST"],
)
