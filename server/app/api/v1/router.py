from fastapi import APIRouter
from app.api.v1.endpoints import matching, jobs, applications

api_router = APIRouter()


api_router.include_router(jobs.router,         prefix="/jobs",         tags=["Jobs"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])