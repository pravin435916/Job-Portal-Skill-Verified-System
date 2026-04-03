from typing import List

from fastapi import APIRouter

from app.schemas.matching import CandidateScore
from app.services.matching_service import match_rank_store_retrieve

router = APIRouter()


@router.get("/jobs/{job_id}/candidates-ranked", response_model=List[CandidateScore])
async def get_ranked_candidates(job_id: str):
    return await match_rank_store_retrieve(job_id)
