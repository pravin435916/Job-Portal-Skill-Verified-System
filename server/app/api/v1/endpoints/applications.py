from fastapi import APIRouter, HTTPException

from app.schemas.application import ApplicationResponse, ApplicationStatusUpdateRequest
from app.services.application_service import to_application_response, upsert_application_status

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
