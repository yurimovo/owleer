from typing import List

from fastapi import APIRouter
from app.v1.company import endpoints as company_endpoints


company_router = APIRouter()


company_router.add_api_route(
    path="/list", endpoint=company_endpoints.get_companies_list, methods=["GET"]
)

company_router.add_api_route(
    path="/search", endpoint=company_endpoints.search, methods=["GET"]
)

company_router.add_api_route(
    path="/{company_uid}/member",
    endpoint=company_endpoints.add_member,
    methods=["POST"],
)

company_router.add_api_route(
    path="/{company_uid}/member",
    endpoint=company_endpoints.remove_member,
    methods=["DELETE"],
)

company_router.add_api_route(
    path="/{company_uid}", endpoint=company_endpoints.get_company, methods=["GET"]
)

company_router.add_api_route(
    path="/{company_uid}", endpoint=company_endpoints.update_company, methods=["PUT"]
)

company_router.add_api_route(
    path="/{company_uid}", endpoint=company_endpoints.delete_company, methods=["DELETE"]
)


company_router.add_api_route(
    path="", endpoint=company_endpoints.create_company, methods=["POST"]
)
