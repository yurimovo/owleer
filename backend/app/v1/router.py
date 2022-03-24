from os import pread
from fastapi import APIRouter

from app.v1.user.router import user_router
from app.v1.project.router import project_router
from app.v1.company.router import company_router
from app.v1.permission.router import permission_router
from app.v1.utils.router import utils_router
from app.v1.integration.router import integration_router
from app.v1.communication.router import communication_router

v1_router = APIRouter()


v1_router.include_router(user_router, prefix="/user", tags=["user"])
v1_router.include_router(project_router, prefix="/project", tags=["project"])
v1_router.include_router(company_router, prefix="/company", tags=["company"])
v1_router.include_router(permission_router, prefix="/permission", tags=["permission"])
v1_router.include_router(utils_router, prefix="/utils", tags=["utils"])
v1_router.include_router(
    integration_router, prefix="/integration", tags=["integration"]
)
v1_router.include_router(
    communication_router, prefix="/communication", tags=["communication"]
)
