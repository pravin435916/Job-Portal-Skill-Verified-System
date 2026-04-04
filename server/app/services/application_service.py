from datetime import datetime
from typing import Optional

from app.models.application import Application


ALLOWED_STATUSES = {"applied", "shortlisted", "rejected", "interview_scheduled"}

def get_all_applications_for_job(job_id: str) -> list[Application]:
    return Application.find(Application.job_id == job_id).to_list()

def to_application_response(application: Application) -> dict:
    return {
        "id": str(application.id),
        "job_id": application.job_id,
        "candidate_id": application.candidate_id,
        "score": application.score,
        "status": application.status,
        "interview_at": application.interview_at,
        "interview_mode": application.interview_mode,
        "notes": application.notes,
    }


async def get_application_by_id(application_id: str) -> Optional[Application]:
    return await Application.get(application_id)


async def get_application_for_job_candidate(job_id: str, candidate_id: str) -> Optional[Application]:
    return await Application.find_one(
        Application.job_id == job_id,
        Application.candidate_id == candidate_id,
    )


async def upsert_application_status(
    application_id: str,
    status: str,
    interview_at: Optional[datetime] = None,
    interview_mode: Optional[str] = None,
    notes: Optional[str] = None,
) -> Optional[Application]:
    application = await get_application_by_id(application_id)
    if not application:
        return None

    normalized_status = status.strip().lower()
    if normalized_status not in ALLOWED_STATUSES:
        raise ValueError(f"Unsupported status: {status}")

    application.status = normalized_status
    application.interview_at = interview_at
    application.interview_mode = interview_mode
    application.notes = notes
    application.updated_at = datetime.utcnow()
    await application.save()
    return application
# app/services/application_service.py
# ADD this function first

from app.models.job import Job

def _job_to_dict(doc) -> dict:
    return {
        "job_id":              str(doc.id),
        "title":               doc.title,
        "description":         doc.description,
        "required_skills":     doc.required_skills,
        "preferred_skills":    doc.preferred_skills,
        "experience_required": doc.experience_required,
    }

async def fetch_all_jobs(search: str = None, skill: str = None, role: str = None):
    all_jobs = await Job.find_all().to_list()
    results  = []

    for job in all_jobs:
        title = job.title.lower()

        if role and role.lower() not in title:
            continue
        if search:
            desc = (job.description or "").lower()
            if search.lower() not in title and search.lower() not in desc:
                continue
        if skill:
            skill_names = [s.get("name", "").lower() for s in job.required_skills]
            if skill.lower() not in skill_names:
                continue

        results.append(_job_to_dict(job))

    return results
