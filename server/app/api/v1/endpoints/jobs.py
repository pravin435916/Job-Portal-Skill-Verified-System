from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional

from app.schemas.job import JobCreate, JobUpdate, JobResponse   # ✅ fixed import
from app.services.job_service import (
    create_job,
    get_recruiter_jobs,
    update_job,
    delete_job,
    get_all_active_jobs,
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


# 🔒 Dummy user — replace with JWT later
def get_current_user():
    return {"id": "recruiter_123"}


# ─────────────────────────────────────────
# POST /jobs  →  Create a job
# ─────────────────────────────────────────
@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job_api(data: JobCreate, user=Depends(get_current_user)):
    job = await create_job(data, user["id"])
    return job


# ─────────────────────────────────────────
# GET /jobs/my  →  Recruiter's own jobs
# ─────────────────────────────────────────
@router.get("/my", response_model=List[JobResponse])
async def get_my_jobs(user=Depends(get_current_user)):
    return await get_recruiter_jobs(user["id"])


# ─────────────────────────────────────────
# PUT /jobs/{id}  →  Update a job
# ─────────────────────────────────────────
@router.put("/{job_id}", response_model=JobResponse)
async def update_job_api(job_id: str, data: JobUpdate, user=Depends(get_current_user)):
    job = await update_job(job_id, data, user["id"])
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or you don't have permission to update it.",
        )
    return job


# ─────────────────────────────────────────
# DELETE /jobs/{id}  →  Delete a job
# ─────────────────────────────────────────
@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_api(job_id: str, user=Depends(get_current_user)):
    deleted = await delete_job(job_id, user["id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or you don't have permission to delete it.",
        )


# ─────────────────────────────────────────
# GET /jobs  →  Public job listing with filters
# ─────────────────────────────────────────
@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    skill: Optional[str] = Query(None, description="Filter by required skill"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
):
    return await get_all_active_jobs(skill=skill, location=location, job_type=job_type)