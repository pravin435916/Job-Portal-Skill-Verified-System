from app.models.candidate import Candidate
from app.models.job import Job
from app.models.job_ranking import JobRanking
from datetime import datetime
import logging
from bson import ObjectId

logger = logging.getLogger(__name__)

# =========================
# SCORING FUNCTIONS
# =========================

def calculate_skill_score(candidate: dict, job: dict) -> dict:
    """
    Weighted skill match against required_skills.
    Each skill has a weight (0-1). Score = sum of matched weights / total weight * 100.
    """
    candidate_skills = set(s.lower() for s in (candidate.get("skills") or []))
    required_skills  = job.get("required_skills") or []

    if not required_skills:
        return {"score": 0, "matched": [], "missing": []}

    total_weight = sum(s["weight"] for s in required_skills)
    earned       = 0.0
    matched      = []
    missing      = []

    for skill in required_skills:
        if skill["name"].lower() in candidate_skills:
            earned += skill["weight"]
            matched.append(skill["name"])
        else:
            missing.append(skill["name"])

    score = (earned / total_weight) * 100 if total_weight else 0
    return {"score": round(score, 2), "matched": matched, "missing": missing}


def calculate_project_score(candidate: dict, job: dict) -> dict:
    """
    Keyword match: how many required_skill keywords appear in project skills.
    Each project skill hit = 10 pts. Capped at 100.
    """
    job_skills = set(s["name"].lower() for s in (job.get("required_skills") or []))
    projects   = candidate.get("projects") or []

    if not job_skills or not projects:
        return {"score": 0, "matched_in_projects": []}

    score            = 0
    matched_in_projects = []

    for project in projects:
        project_skills = set(s.lower() for s in (project.get("skills") or []))
        hits = project_skills & job_skills
        if hits:
            score += len(hits) * 10
            matched_in_projects.append({
                "project": project.get("title") or project.get("name", "Untitled"),
                "matched_skills": list(hits),
            })

    return {
        "score": round(min(score, 100), 2),
        "matched_in_projects": matched_in_projects,
    }


def calculate_education_score(candidate: dict, job: dict) -> dict:
    """
    Keyword match: check if job description / required keywords
    relate to candidate's degree or field_of_study.

    Scoring:
      - Has any education entry           → 40 pts base
      - field_of_study contains CS/IT/SE  → +40 pts
      - degree is B.Tech / M.Tech / B.E   → +20 pts
    """
    education = candidate.get("education") or []

    if not education:
        return {"score": 0, "detail": "No education listed"}

    CS_FIELDS = {
        "computer science", "information technology", "software engineering",
        "computer engineering", "electronics", "information systems",
        "data science", "artificial intelligence", "mathematics", "statistics",
    }
    TECH_DEGREES = {"b.tech", "m.tech", "b.e", "m.e", "b.sc", "m.sc", "mca", "bca", "phd"}

    best_score  = 0
    best_detail = ""

    for edu in education:
        score  = 40  # base for having education
        field  = (edu.get("field_of_study") or edu.get("field") or "").lower()
        degree = (edu.get("degree") or "").lower()

        if any(f in field for f in CS_FIELDS):
            score += 40
        if any(d in degree for d in TECH_DEGREES):
            score += 20

        if score > best_score:
            best_score  = score
            best_detail = f"{edu.get('degree', '')} in {edu.get('field_of_study', '')}"

    return {"score": round(min(best_score, 100), 2), "detail": best_detail}


def calculate_activity_score(candidate: dict) -> dict:
    """
    Keyword/count based activity scoring without any AI.

    Checks platform_activity if present, otherwise falls back to
    counting projects + experience as a proxy.
    """
    activity = candidate.get("platform_activity") or {}
    github   = activity.get("github") or {}
    leetcode = activity.get("leetcode") or {}

    # If platform_activity is populated — use it
    if github or leetcode:
        repos           = min(github.get("public_repos", 0), 30)
        commits         = min(github.get("commits_last_year", 0), 500)
        stars           = min(github.get("total_stars", 0), 100)
        problems_solved = min(leetcode.get("problems_solved", 0), 400)

        score = (
            (repos   / 30)  * 25 +
            (commits / 500) * 35 +
            (stars   / 100) * 15 +
            (problems_solved / 400) * 25
        )
        return {"score": round(min(score, 100), 2), "source": "platform_activity"}

    # Fallback: proxy score from projects + experience count
    project_count    = len(candidate.get("projects") or [])
    experience_count = len(candidate.get("experience") or [])

    score = min(project_count * 15 + experience_count * 20, 100)
    return {"score": round(score, 2), "source": "proxy"}


def calculate_completeness_score(candidate: dict) -> dict:
    """
    Profile completeness based on filled fields.
    """
    fields = [
        ("first_name",  10),
        ("last_name",   10),
        ("bio",         10),
        ("skills",      20),   # must be non-empty list
        ("projects",    20),   # must be non-empty list
        ("education",   15),
        ("experience",  10),
        ("phone_number", 5),
    ]

    earned  = 0
    missing = []

    for field, weight in fields:
        value  = candidate.get(field)
        filled = (
            bool(value.strip()) if isinstance(value, str)
            else bool(value)    if isinstance(value, list)
            else value is not None
        )
        if filled:
            earned += weight
        else:
            missing.append(field)

    return {"score": round(earned, 2), "missing_fields": missing}


WEIGHTS = {
    "skills":       0.40,
    "projects":     0.30,
    "education":    0.15,
    "activity":     0.10,
    "completeness": 0.05,
}


def calculate_final_score(candidate: dict, job: dict) -> dict:
    skill_result        = calculate_skill_score(candidate, job)
    project_result      = calculate_project_score(candidate, job)
    education_result    = calculate_education_score(candidate, job)
    activity_result     = calculate_activity_score(candidate)
    completeness_result = calculate_completeness_score(candidate)

    s_skill        = skill_result["score"]
    s_project      = project_result["score"]
    s_education    = education_result["score"]
    s_activity     = activity_result["score"]
    s_completeness = completeness_result["score"]

    # Bonus: all required skills matched
    bonus = 5 if skill_result["missing"] == [] and skill_result["matched"] else 0

    final = (
        s_skill        * WEIGHTS["skills"]       +
        s_project      * WEIGHTS["projects"]      +
        s_education    * WEIGHTS["education"]     +
        s_activity     * WEIGHTS["activity"]      +
        s_completeness * WEIGHTS["completeness"]  +
        bonus
    )

    return {
        # sub-scores
        "skill_score":        round(s_skill, 2),
        "project_score":      round(s_project, 2),
        "education_score":    round(s_education, 2),
        "activity_score":     round(s_activity, 2),
        "completeness_score": round(s_completeness, 2),
        "bonus":              bonus,
        "final_score":        round(min(final, 100), 2),
        # detail
        "matched_skills":          skill_result["matched"],
        "missing_skills":          skill_result["missing"],
        "matched_in_projects":     project_result["matched_in_projects"],
        "education_detail":        education_result["detail"],
        "activity_source":         activity_result["source"],
        "completeness_missing":    completeness_result["missing_fields"],
    }


# =========================
# MAIN MATCH FUNCTION
# =========================

async def match_rank_store_retrieve(
    job_id: str,
    limit: int = 50,
    minScore: float = 0,
):
    logger.info(f"Matching request for job={job_id} limit={limit} minScore={minScore}")

    # 1. CHECK CACHE — but apply minScore/limit in memory, not on cache key
    existing = await JobRanking.find_one(JobRanking.job_id == job_id)
    if existing:
        logger.info("Serving from cache")
        filtered = [c for c in existing.rankings if c["final_score"] >= minScore]
        return filtered[:limit]

    # 2. FETCH JOB
    job = await Job.get(job_id)
    if not job:
        return {"error": "Job not found"}

    job_dict = job.dict()

    # 3. FETCH APPLICANTS
    candidate_ids = job.applicants or []
    if not candidate_ids:
        return []

    candidates = await Candidate.find(
        {"_id": {"$in": [ObjectId(cid) for cid in candidate_ids]}}
    ).to_list()

    if not candidates:
        return []

    # 4. SCORE ALL (no minScore filter here — cache full list)
    ranked = []

    for candidate in candidates:
        candidate_dict = candidate.dict()
        scores         = calculate_final_score(candidate_dict, job_dict)

        ranked.append({
            "candidate_id": str(candidate.id),
            "name":         f"{candidate.first_name} {candidate.last_name}",
            "email":        candidate.email,
            **scores,
        })

    # 5. SORT
    ranked.sort(key=lambda x: x["final_score"], reverse=True)

    # 6. CACHE FULL LIST (minScore/limit applied on read, not stored)
    await JobRanking.find_one(JobRanking.job_id == job_id).update_one(
        {
            "$set": {
                "job_id":       job_id,
                "rankings":     ranked,
                "last_updated": datetime.utcnow(),
            }
        },
        upsert=True,
    )

    logger.info(f"Matched {len(ranked)} candidates for job {job_id}")

    # 7. FILTER + LIMIT IN MEMORY
    filtered = [c for c in ranked if c["final_score"] >= minScore]
    return filtered[:limit]