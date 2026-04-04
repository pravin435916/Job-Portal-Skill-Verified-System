from datetime import datetime

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.schemas.application import ApplicationResponse, ApplicationStatusUpdateRequest

router = APIRouter()

ALLOWED_STATUSES = {"applied", "shortlisted", "rejected", "interview_scheduled"}
STATUS_MESSAGES = {
    "applied": "Application submitted successfully",
    "shortlisted": "Candidate has been shortlisted",
    "rejected": "Candidate was not selected",
    "interview_scheduled": "Interview has been scheduled",
}


def _normalize_object_id(value: str, field_name: str) -> str:
    try:
        return str(PydanticObjectId(value))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}") from exc


def _to_application_response(application: Application) -> dict:
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


def _normalize_status(value: str) -> str:
    normalized = value.strip().lower()
    if normalized == "interview":
        normalized = "interview_scheduled"

    if normalized not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Unsupported status: {value}")

    return normalized


async def _get_application_by_id_or_404(application_id: str) -> Application:
    normalized_application_id = _normalize_object_id(application_id, "application ID")
    app = await Application.get(PydanticObjectId(normalized_application_id))
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


def _job_lookup_query(job_id: str, normalized_job_id: str) -> dict:
    job_oid = PydanticObjectId(normalized_job_id)
    return {
        "$or": [
            {"job_id": normalized_job_id},
            {"job_id": job_id},
            {"job_id": job_oid},
        ]
    }


@router.get("/job/{job_id}", response_model=list[ApplicationResponse])
@router.get("/jobs/{job_id}", response_model=list[ApplicationResponse])
@router.get("/jobs/{job_id}/applications", response_model=list[ApplicationResponse])
async def get_applications_for_job(job_id: str):
    normalized_job_id = _normalize_object_id(job_id, "job ID")
    applications = await Application.find(
        _job_lookup_query(job_id, normalized_job_id)
    ).sort("-applied_at").to_list()
    return [_to_application_response(app) for app in applications]


@router.put("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(application_id: str, payload: ApplicationStatusUpdateRequest):
    app = await _get_application_by_id_or_404(application_id)
    next_status = _normalize_status(payload.status)

    if next_status not in {"shortlisted", "rejected", "interview_scheduled", "applied"}:
        raise HTTPException(status_code=400, detail="Unsupported recruiter status")

    app.status = next_status
    app.interview_at = payload.interview_at
    app.interview_mode = payload.interview_mode
    app.notes = payload.notes
    app.updated_at = datetime.utcnow()
    await app.save()

    return _to_application_response(app)


class ApplyRequest(BaseModel):
    job_id:       str
    candidate_id: str     # send this manually until auth is ready


@router.post("/", status_code=201)
async def apply_for_job(body: ApplyRequest):
    """
    POST /api/v1/applications/
    Body: {
        "job_id": "...",
        "candidate_id": "..."   ← paste from MongoDB Atlas candidates collection
    }
    """
    # 1. Check candidate exists
    normalized_candidate_id = _normalize_object_id(body.candidate_id, "candidate ID")
    candidate_oid = PydanticObjectId(normalized_candidate_id)
    candidate = await Candidate.get(candidate_oid)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # 2. Check job exists
    normalized_job_id = _normalize_object_id(body.job_id, "job ID")
    job_oid = PydanticObjectId(normalized_job_id)
    job = await Job.get(job_oid)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 3. Prevent duplicate application
    existing = await Application.find_one(
        {
            "$or": [
                {
                    "job_id": normalized_job_id,
                    "candidate_id": normalized_candidate_id,
                },
                {
                    "job_id": job_oid,
                    "candidate_id": candidate_oid,
                },
            ]
        }
    )
    if existing:
        raise HTTPException(status_code=409, detail="You already applied for this job")

    # 4. Save application document
    app = Application(
        job_id       = normalized_job_id,
        candidate_id = normalized_candidate_id,
        status       = "applied",
        applied_at   = datetime.utcnow()
    )
    await app.insert()

    # 5. Add candidate_id to job's applicants list
    job.applicants.append(normalized_candidate_id)
    await job.save()

    return {
        "message":        "Applied successfully ✅",
        "application_id": str(app.id),
        "job_id":         normalized_job_id,
        "job_title":      job.title,
        "candidate_id":   normalized_candidate_id,
        "candidate_name": f"{candidate.first_name} {candidate.last_name}",
        "status":         "applied"
    }


@router.get("/track/{application_id}")
@router.get("/{application_id}/status")
@router.get("/status/{application_id}")
async def track_application(application_id: str):
    """
    GET /api/v1/applications/track/{application_id}
    Returns current status of a specific application.
    Paste application_id from the apply response.
    """
    app = await _get_application_by_id_or_404(application_id)

    # fetch job title
    try:
        job = await Job.get(PydanticObjectId(app.job_id))
        job_title = job.title if job else "Unknown"
    except Exception:
        job_title = "Unknown"

    status_value = _normalize_status(app.status)

    return {
        "application_id": str(app.id),
        "job_id":         app.job_id,
        "job_title":      job_title,
        "candidate_id":   app.candidate_id,
        "status":         status_value,
        "status_message": STATUS_MESSAGES.get(status_value, "Unknown"),
        "applied_at":     app.applied_at,
        "interview_at":   app.interview_at,
        "interview_mode": app.interview_mode,
        "notes":          app.notes,
    }


@router.get("/my/{candidate_id}")
async def my_applications(candidate_id: str):
    """
    GET /api/v1/applications/my/{candidate_id}
    Returns all applications of a candidate.
    Paste candidate_id from Atlas.
    """
    # Validate candidate exists
    normalized_candidate_id = _normalize_object_id(candidate_id, "candidate ID")
    candidate_oid = PydanticObjectId(normalized_candidate_id)
    candidate = await Candidate.get(candidate_oid)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    apps = await Application.find(
        {
            "$or": [
                {"candidate_id": normalized_candidate_id},
                {"candidate_id": candidate_id},
                {"candidate_id": candidate_oid},
            ]
        }
    ).to_list()

    result = []
    for a in apps:
        try:
            job = await Job.get(PydanticObjectId(a.job_id))
            job_title = job.title if job else "Unknown"
        except Exception:
            job_title = "Unknown"

        result.append({
            "application_id": str(a.id),
            "job_id":         a.job_id,
            "job_title":      job_title,
            "status":         a.status,
            "applied_at":     a.applied_at,
        })

    return result
