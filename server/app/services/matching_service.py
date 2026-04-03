from app.models.candidate import Candidate
from app.models.job import Job
from app.models.job_ranking import JobRanking
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

async def match_rank_store_retrieve(job_id: str):
    logger.info(f"Matching request for job {job_id}")

    # 🔥 1. CHECK EXISTING
    existing = await JobRanking.find_one(JobRanking.job_id == job_id)
    if existing:
        logger.info("Returning cached ranking")
        return existing.rankings

    # 🔥 2. FETCH JOB
    job = await Job.get(job_id)
    if not job:
        return {"error": "Job not found"}

    ranked_candidates = []

    # 🔥 3. FETCH CANDIDATES
    candidates = await Candidate.find_all().to_list()

    for candidate in candidates:
        scores = calculate_final_score(candidate.dict(), job.dict())

        matched_skills = list(
            set([s["name"] for s in candidate.skills]) &
            set([s["name"] for s in job.required_skills])
        )

        ranked_candidates.append({
            "candidate_id": str(candidate.id),
            "name": candidate.name,
            "matched_skills": matched_skills,
            **scores
        })

    # 🔥 4. SORT
    ranked_candidates.sort(key=lambda x: x["final_score"], reverse=True)

    # 🔥 5. LIMIT
    ranked_candidates = ranked_candidates[:50]

    # 🔥 6. STORE
    await JobRanking(
        job_id=job_id,
        rankings=ranked_candidates,
        last_updated=datetime.utcnow()
    ).insert()

    logger.info("Matching completed")

    return ranked_candidates