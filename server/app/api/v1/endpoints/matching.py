from fastapi import APIRouter, Query
from app.services.matching_service import match_rank_store_retrieve

router = APIRouter()

@router.get("/jobs/{job_id}/candidates-ranked")
async def get_ranked_candidates(
    job_id: str,
    limit: int = Query(50, ge=1, le=500)  # ✅ default=50, min=1, max=500
):
    return await match_rank_store_retrieve(job_id, limit)