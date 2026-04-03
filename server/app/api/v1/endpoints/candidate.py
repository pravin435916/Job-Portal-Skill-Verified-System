from fastapi import APIRouter, HTTPException

from app.schemas.candidate import CandidateResponse
from app.services.candidate_service import get_candidate_by_id, to_candidate_response

router = APIRouter()


@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(candidate_id: str):
    candidate = await get_candidate_by_id(candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return to_candidate_response(candidate)
