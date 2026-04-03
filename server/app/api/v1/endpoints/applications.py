from fastapi import APIRouter, HTTPException

from app.schemas.application import ApplicationResponse, ApplicationStatusUpdateRequest
from app.services.application_service import to_application_response, upsert_application_status
from app.models.job import Job
from app.models.application import Application
from app.models.candidate import Candidate
from beanie import PydanticObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()


@router.put("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(application_id: str, payload: ApplicationStatusUpdateRequest):
    try:
        updated = await upsert_application_status(
            application_id=application_id,
            status=payload.status,
            interview_at=payload.interview_at,
            interview_mode=payload.interview_mode,
            notes=payload.notes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")

    return to_application_response(updated)
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
    try:
        c_oid = PydanticObjectId(body.candidate_id)
        candidate = await Candidate.get(c_oid)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid candidate ID")

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # 2. Check job exists
    try:
        j_oid = PydanticObjectId(body.job_id)
        job = await Job.get(j_oid)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 3. Prevent duplicate application
    if body.candidate_id in job.applicants:
        raise HTTPException(status_code=409, detail="You already applied for this job")

    # 4. Save application document
    app = Application(
        job_id       = body.job_id,
        candidate_id = body.candidate_id,
        status       = "applied",
        applied_at   = datetime.utcnow()
    )
    await app.insert()

    # 5. Add candidate_id to job's applicants list
    job.applicants.append(body.candidate_id)
    await job.save()

    return {
        "message":        "Applied successfully ✅",
        "application_id": str(app.id),
        "job_id":         body.job_id,
        "job_title":      job.title,
        "candidate_id":   body.candidate_id,
        "candidate_name": f"{candidate.first_name} {candidate.last_name}",
        "status":         "applied"
    }


@router.get("/track/{application_id}")
async def track_application(application_id: str):
    """
    GET /api/v1/applications/track/{application_id}
    Returns current status of a specific application.
    Paste application_id from the apply response.
    """
    try:
        oid = PydanticObjectId(application_id)
        app = await Application.get(oid)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")

    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # fetch job title
    try:
        job = await Job.get(PydanticObjectId(app.job_id))
        job_title = job.title if job else "Unknown"
    except Exception:
        job_title = "Unknown"

    messages = {
        "applied":     "✅ Application submitted successfully",
        "shortlisted": "🌟 You have been shortlisted!",
        "rejected":    "❌ Not selected this time",
        "interview":   "📅 Interview has been scheduled",
    }

    return {
        "application_id": str(app.id),
        "job_id":         app.job_id,
        "job_title":      job_title,
        "candidate_id":   app.candidate_id,
        "status":         app.status,
        "status_message": messages.get(app.status, "Unknown"),
        "applied_at":     app.applied_at,
    }


@router.get("/my/{candidate_id}")
async def my_applications(candidate_id: str):
    """
    GET /api/v1/applications/my/{candidate_id}
    Returns all applications of a candidate.
    Paste candidate_id from Atlas.
    """
    # Validate candidate exists
    try:
        candidate = await Candidate.get(PydanticObjectId(candidate_id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid candidate ID")

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    apps = await Application.find(
        Application.candidate_id == candidate_id
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
