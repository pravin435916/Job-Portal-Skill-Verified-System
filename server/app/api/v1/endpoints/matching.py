from fastapi import APIRouter, Query
from app.services.matching_service import match_rank_store_retrieve

router = APIRouter()

@router.get("/jobs/{job_id}/candidates-ranked")
async def get_ranked_candidates(
    job_id: str,
    minScore: float = Query(default=0,  ge=0, le=100, description="Minimum final score filter"),
    limit:    int   = Query(default=50, ge=1, le=200, description="Max candidates to return"),
):
    return await match_rank_store_retrieve(
        job_id=job_id,
        min_score=minScore,
        limit=limit,
    )
 