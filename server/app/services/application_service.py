from datetime import datetime
from typing import Optional

from app.models.application import Application


ALLOWED_STATUSES = {"applied", "shortlisted", "rejected", "interview_scheduled"}


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
