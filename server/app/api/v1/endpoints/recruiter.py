from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException

from app.models.recruiter import Recruiter
from app.schemas.recruiter import (
    RecruiterJobCreate,
    RecruiterJobResponse,
    RecruiterJobUpdate,
    RecruiterProfileResponse,
    RecruiterProfileUpsert,
)
from app.services.job_service import (
    create_recruiter_job,
    delete_recruiter_job,
    get_recruiter_job,
    list_recruiter_jobs,
    update_recruiter_job,
)

router = APIRouter()


def _normalize_recruiter_id(recruiter_id: str) -> str:
    try:
        return str(PydanticObjectId(recruiter_id))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid recruiter ID") from exc


def _to_recruiter_response(recruiter: Recruiter) -> dict:
    return {
        "recruiter_id": str(recruiter.id),
        "name": recruiter.name,
        "email": recruiter.email,
        "company": recruiter.company,
    }


@router.post("/register", response_model=RecruiterProfileResponse, status_code=201)
async def register_recruiter(payload: RecruiterProfileUpsert):
    recruiter = Recruiter(
        name=payload.name,
        email=payload.email,
        company=payload.company,
    )
    await recruiter.insert()
    return _to_recruiter_response(recruiter)


@router.put("/{recruiter_id}/profile", response_model=RecruiterProfileResponse)
async def upsert_recruiter_profile(recruiter_id: str, payload: RecruiterProfileUpsert):
    normalized_recruiter_id = _normalize_recruiter_id(recruiter_id)
    recruiter = await Recruiter.get(PydanticObjectId(normalized_recruiter_id))

    if recruiter:
        recruiter.name = payload.name
        recruiter.email = payload.email
        recruiter.company = payload.company
        await recruiter.save()
        return _to_recruiter_response(recruiter)

    recruiter = Recruiter(
        id=PydanticObjectId(normalized_recruiter_id),
        name=payload.name,
        email=payload.email,
        company=payload.company,
    )
    await recruiter.insert()
    return _to_recruiter_response(recruiter)


@router.get("/{recruiter_id}/profile", response_model=RecruiterProfileResponse)
async def get_recruiter_profile(recruiter_id: str):
    normalized_recruiter_id = _normalize_recruiter_id(recruiter_id)
    recruiter = await Recruiter.get(PydanticObjectId(normalized_recruiter_id))
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    return _to_recruiter_response(recruiter)


@router.post("/{recruiter_id}/jobs", response_model=RecruiterJobResponse, status_code=201)
async def create_job_for_recruiter(recruiter_id: str, payload: RecruiterJobCreate):
    normalized_recruiter_id = _normalize_recruiter_id(recruiter_id)

    recruiter = await Recruiter.get(PydanticObjectId(normalized_recruiter_id))
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    created = await create_recruiter_job(
        recruiter_id=normalized_recruiter_id,
        payload=payload.dict(),
    )
    return created


@router.get("/{recruiter_id}/jobs", response_model=list[RecruiterJobResponse])
async def get_jobs_for_recruiter(recruiter_id: str):
    normalized_recruiter_id = _normalize_recruiter_id(recruiter_id)
    return await list_recruiter_jobs(normalized_recruiter_id)


@router.get("/{recruiter_id}/jobs/{job_id}", response_model=RecruiterJobResponse)
async def get_single_recruiter_job(recruiter_id: str, job_id: str):
    normalized_recruiter_id = _normalize_recruiter_id(recruiter_id)
    job = await get_recruiter_job(normalized_recruiter_id, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found for recruiter")

    return job


@router.put("/{recruiter_id}/jobs/{job_id}", response_model=RecruiterJobResponse)
async def update_single_recruiter_job(
    recruiter_id: str,
    job_id: str,
    payload: RecruiterJobUpdate,
):
    normalized_recruiter_id = _normalize_recruiter_id(recruiter_id)
    updated = await update_recruiter_job(
        normalized_recruiter_id,
        job_id,
        payload.dict(exclude_unset=True),
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Job not found for recruiter")

    return updated


@router.delete("/{recruiter_id}/jobs/{job_id}")
async def delete_single_recruiter_job(recruiter_id: str, job_id: str):
    normalized_recruiter_id = _normalize_recruiter_id(recruiter_id)
    deleted = await delete_recruiter_job(normalized_recruiter_id, job_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Job not found for recruiter")

    return {"message": "Job deleted successfully", "job_id": job_id}
