from fastapi import APIRouter


from app.v1.project.order import endpoints as order_endpoints

order_router = APIRouter()


order_router.add_api_route(
    path="/{order_uid}/approve",
    methods=["POST"],
    endpoint=order_endpoints.approve_order,
)


order_router.add_api_route(
    path="/{order_uid}", methods=["GET"], endpoint=order_endpoints.fetch_order
)
