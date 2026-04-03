from app.core.db import mongodb
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
def calculate_skill_score(candidate, job):
    candidate_skills = [s["name"] for s in candidate.get("skills", [])]

    score = 0
    total_weight = 0

    for skill in job.get("required_skills", []):
        total_weight += skill["weight"]

        if skill["name"] in candidate_skills:
            score += skill["weight"] * 100

    return score / total_weight if total_weight else 0

def calculate_resume_score(candidate, job):
    resume_skills = set(candidate.get("resume", {}).get("extracted_skills", []))
    job_skills = set([s["name"] for s in job.get("required_skills", [])])

    matched = resume_skills & job_skills

    return (len(matched) / len(job_skills)) * 100 if job_skills else 0

def calculate_project_score(candidate, job):
    score = 0

    job_skills = set([s["name"] for s in job.get("required_skills", [])])

    for project in candidate.get("projects", []):
        tech_stack = set(project.get("tech_stack", []))

        match = len(tech_stack & job_skills)

        score += match * 10

        if project.get("verified"):
            score += 5

    return min(score, 100)


def calculate_activity_score(candidate):
    activity = candidate.get("activity", {})

    commits = activity.get("github_commits", 0)
    last_active = activity.get("last_active_days", 30)

    commit_score = min(commits / 10, 50)  # max 50
    recency_score = max(0, 50 - last_active)  # recent = higher

    return commit_score + recency_score

def calculate_final_score(candidate, job):
    skill_score = calculate_skill_score(candidate, job)
    resume_score = calculate_resume_score(candidate, job)
    project_score = calculate_project_score(candidate, job)
    activity_score = calculate_activity_score(candidate)

    bonus = 5 if skill_score == 100 else 0

    final_score = (
        resume_score * 0.4 +
        skill_score * 0.25 +
        project_score * 0.2 +
        activity_score * 0.1 +
        bonus * 0.05
    )

    return {
        "skill_score": round(skill_score, 2),
        "resume_score": round(resume_score, 2),
        "project_score": round(project_score, 2),
        "activity_score": round(activity_score, 2),
        "bonus": bonus,
        "final_score": round(final_score, 2)
    }


async def match_rank_store_retrieve(job_id: str):
    logger.info(f"Matching request for job {job_id}")

    # 🔥 1. CHECK CACHE (DB)
    existing = await mongodb.db.job_rankings.find_one({"job_id": job_id})
    if existing:
        logger.info("Returning cached ranking")
        return existing["rankings"]

    # 🔥 2. FETCH JOB
    job = await mongodb.db.jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        return {"error": "Job not found"}

    ranked_candidates = []

    # 🔥 3. COMPUTE
    async for candidate in mongodb.db.candidates.find():
        scores = calculate_final_score(candidate, job)

        matched_skills = list(
            set([s["name"] for s in candidate.get("skills", [])]) &
            set([s["name"] for s in job.get("required_skills", [])])
        )

        ranked_candidates.append({
            "candidate_id": str(candidate["_id"]),
            "name": candidate.get("name"),
            "matched_skills": matched_skills,
            **scores
        })

    # 🔥 4. SORT
    ranked_candidates.sort(key=lambda x: x["final_score"], reverse=True)

    # 🔥 5. LIMIT (IMPORTANT)
    ranked_candidates = ranked_candidates[:50]

    # 🔥 6. STORE
    await mongodb.db.job_rankings.update_one(
        {"job_id": job_id},
        {
            "$set": {
                "job_id": job_id,
                "rankings": ranked_candidates,
                "last_updated": datetime.utcnow()
            }
        },
        upsert=True
    )

    logger.info("Matching + ranking completed")

    return ranked_candidates