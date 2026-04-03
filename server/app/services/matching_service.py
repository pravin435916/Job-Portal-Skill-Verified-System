from app.models.candidate import Candidate
from app.models.job import Job
from app.models.job_ranking import JobRanking
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# =========================
# 🔥 SCORING FUNCTIONS
# =========================

def calculate_skill_score(candidate, job):
    candidate_skills = candidate.get("skills") or []

    score = 0
    total_weight = 0

    for skill in job.get("required_skills", []):
        total_weight += skill["weight"]

        if skill["name"] in candidate_skills:
            score += skill["weight"] * 100

    return score / total_weight if total_weight else 0


def calculate_resume_score(candidate, job):
    # basic version (you can upgrade later)
    resume_skills = set(candidate.get("skills") or [])
    job_skills = set([s["name"] for s in job.get("required_skills", [])])

    matched = resume_skills & job_skills

    return (len(matched) / len(job_skills)) * 100 if job_skills else 0


def calculate_project_score(candidate, job):
    score = 0

    job_skills = set([s["name"] for s in job.get("required_skills", [])])

    for project in candidate.get("projects") or []:
        project_skills = set(project.get("skills") or [])

        match = len(project_skills & job_skills)
        score += match * 10

    return min(score, 100)


def calculate_activity_score(candidate):
    # since your schema doesn't have activity, keep basic
    return 50  # constant for now


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


# =========================
# 🚀 MAIN MATCH FUNCTION
# =========================

async def match_rank_store_retrieve(job_id: str,limit: int = 50):
    logger.info(f"Matching request for job {job_id}")

    # 🔥 1. CHECK CACHE
    existing = await JobRanking.find_one(JobRanking.job_id == job_id)
    if existing:
        logger.info("Returning cached ranking")
        return existing.rankings[:limit]

    # 🔥 2. FETCH JOB
    job = await Job.get(job_id)
    if not job:
        return {"error": "Job not found"}

    ranked_candidates = []

    # 🔥 3. FETCH CANDIDATES
    candidates = await Candidate.find_all().to_list()

    for candidate in candidates:
        candidate_dict = candidate.dict()
        job_dict = job.dict()

        scores = calculate_final_score(candidate_dict, job_dict)

        # ✅ MATCHED SKILLS
        candidate_skills = candidate.skills or []
        job_skills = [s["name"] for s in job.required_skills]

        matched_skills = list(set(candidate_skills) & set(job_skills))

        ranked_candidates.append({
            "candidate_id": str(candidate.id),
            "name": f"{candidate.first_name} {candidate.last_name}",
            "matched_skills": matched_skills,
            **scores
        })

    # 🔥 4. SORT
    ranked_candidates.sort(key=lambda x: x["final_score"], reverse=True)

    # 🔥 5. LIMIT
    ranked_candidates = ranked_candidates[:limit]

    # 🔥 6. STORE (UPSERT)
    await JobRanking.find_one(JobRanking.job_id == job_id).update_one(
        {
            "$set": {
                "job_id": job_id,
                "rankings": ranked_candidates,
                "last_updated": datetime.utcnow()
            }
        },
        upsert=True
    )

    logger.info("Matching completed")

    return ranked_candidates