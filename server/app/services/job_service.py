from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate, JobResponse


def _to_response(job: Job) -> JobResponse:
    return JobResponse(
        job_id=str(job.id),
        title=job.title,
        description=job.description,
        company_name=job.company_name,
        location=job.location,
        job_type=job.job_type,
        job_mode=job.job_mode,
        required_skills=job.required_skills,
        preferred_skills=job.preferred_skills,
        experience_required=job.experience_required,
        salary_range=job.salary_range,
        openings=job.openings,
        recruiter_id=job.recruiter_id,
        is_active=job.is_active,
        created_at=job.created_at,
        updated_at=job.updated_at,
        application_deadline=job.application_deadline,
    )


async def create_job(data: JobCreate, recruiter_id: str) -> JobResponse:
    job = Job(
        title=data.title,
        description=data.description,
        company_name=data.company_name,
        location=data.location,
        job_type=data.job_type,
        job_mode=data.job_mode,
        required_skills=data.required_skills,
        preferred_skills=data.preferred_skills,
        experience_required=data.experience_required,
        salary_range=data.salary_range,
        openings=data.openings,
        recruiter_id=recruiter_id,
        application_deadline=data.application_deadline,
    )
    await job.insert()
    return _to_response(job)


async def get_recruiter_jobs(recruiter_id: str) -> List[JobResponse]:
    jobs = await Job.find(Job.recruiter_id == recruiter_id).to_list()
    return [_to_response(j) for j in jobs]


async def update_job(job_id: str, data: JobUpdate, recruiter_id: str) -> Optional[JobResponse]:
    job = await Job.get(job_id)
    if not job or job.recruiter_id != recruiter_id:
        return None

    update_data = data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()

    for field, value in update_data.items():
        setattr(job, field, value)

    await job.save()
    return _to_response(job)


async def delete_job(job_id: str, recruiter_id: str) -> bool:
    job = await Job.get(job_id)
    if not job or job.recruiter_id != recruiter_id:
        return False
    await job.delete()
    return True


async def get_all_active_jobs(
    skill: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None,
) -> List[JobResponse]:
    query = Job.find(Job.is_active == True)

    if skill:
        query = query.find({"required_skills": {"$in": [skill]}})
    if location:
        query = query.find({"location": {"$regex": location, "$options": "i"}})
    if job_type:
        query = query.find(Job.job_type == job_type)

    jobs = await query.to_list()
    return [_to_response(j) for j in jobs]