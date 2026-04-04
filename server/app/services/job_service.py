from typing import Optional

from beanie import PydanticObjectId

from app.models.job import Job


def _to_job_response(job: Job) -> dict:
    return {
        "job_id": str(job.id),
        "recruiter_id": job.recruiter_id,
        "title": job.title,
        "description": job.description,
        "company_name": job.company_name,
        "location": job.location,
        "job_type": job.job_type,
        "job_mode": job.job_mode,
        "required_skills": job.required_skills,
        "preferred_skills": job.preferred_skills,
        "experience_required": job.experience_required,
        "salary_range": job.salary_range,
        "openings": job.openings,
        "application_deadline": job.application_deadline,
        "applicants_count": len(job.applicants),
    }


async def create_recruiter_job(recruiter_id: str, payload: dict) -> dict:
    job = Job(recruiter_id=recruiter_id, **payload)
    await job.insert()
    return _to_job_response(job)


async def list_recruiter_jobs(recruiter_id: str) -> list[dict]:
    jobs = await Job.find(Job.recruiter_id == recruiter_id).to_list()
    return [_to_job_response(job) for job in jobs]


async def get_recruiter_job(recruiter_id: str, job_id: str) -> Optional[dict]:
    try:
        oid = PydanticObjectId(job_id)
    except Exception:
        return None

    job = await Job.get(oid)
    if not job or job.recruiter_id != recruiter_id:
        return None

    return _to_job_response(job)


async def update_recruiter_job(recruiter_id: str, job_id: str, payload: dict) -> Optional[dict]:
    try:
        oid = PydanticObjectId(job_id)
    except Exception:
        return None

    job = await Job.get(oid)
    if not job or job.recruiter_id != recruiter_id:
        return None

    for key, value in payload.items():
        setattr(job, key, value)

    await job.save()
    return _to_job_response(job)


async def delete_recruiter_job(recruiter_id: str, job_id: str) -> bool:
    try:
        oid = PydanticObjectId(job_id)
    except Exception:
        return False

    job = await Job.get(oid)
    if not job or job.recruiter_id != recruiter_id:
        return False

    await job.delete()
    return True
