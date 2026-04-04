from fastapi import APIRouter

from app.api.v1.endpoints import applications, candidate, matching, jobs, recruiter

api_router = APIRouter()

api_router.include_router(matching.router, tags=["Matching"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(candidate.router, prefix="/candidate", tags=["Candidate"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(recruiter.router, prefix="/recruiter", tags=["Recruiter"])
