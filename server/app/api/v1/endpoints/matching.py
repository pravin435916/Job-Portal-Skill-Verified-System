from fastapi import APIRouter
from app.services.matching_service import match_rank_store_retrieve

router = APIRouter()

@router.get("/jobs/{job_id}/candidates-ranked")
async def get_ranked_candidates(job_id: str):
    return await match_rank_store_retrieve(job_id)