from fastapi import APIRouter, HTTPException
from app.models.job import Job
from app.models.candidate import Candidate
from beanie import PydanticObjectId

router = APIRouter()


def _skill_to_name(value) -> str:
    if isinstance(value, str):
        return value.strip().lower()

    if isinstance(value, dict):
        return str(value.get("name", "")).strip().lower()

    return ""


def _extract_skill_names(values) -> set[str]:
    names: set[str] = set()
    for item in values or []:
        name = _skill_to_name(item)
        if name:
            names.add(name)
    return names


def job_to_dict(job) -> dict:
    return {
        "job_id":              str(job.id),
        "title":               job.title,
        "description":         job.description,
        "required_skills":     job.required_skills,
        "preferred_skills":    job.preferred_skills,
        "experience_required": job.experience_required,
        "applicants":          job.applicants,
    }


@router.get("/")
async def list_jobs():
    """
    GET /api/v1/jobs/
    Returns all jobs. Public — no token needed.
    """
    jobs = await Job.find_all().to_list()
    return [job_to_dict(j) for j in jobs]


@router.get("/recommend/{candidate_id}")
async def recommend_jobs(candidate_id: str):
    """
    GET /api/v1/jobs/recommend/{candidate_id}
    Returns jobs matched to candidate's skills.
    Paste candidate_id from Atlas.
    """
    # 1. Get candidate
    try:
        candidate = await Candidate.get(PydanticObjectId(candidate_id))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid candidate ID")

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # 2. Get candidate skill names (supports both string and object shapes)
    candidate_skills = _extract_skill_names(candidate.skills)

    if not candidate_skills:
        raise HTTPException(
            status_code=400,
            detail="No skills found in your profile. Please add skills first."
        )

    # 3. Match jobs
    all_jobs = await Job.find_all().to_list()
    matched = []

    for job in all_jobs:
        job_skill_names = _extract_skill_names(job.required_skills)
        common = candidate_skills & job_skill_names

        if common:
            # score = number of matched skills
            score = len(common)
            matched.append({
                "job_id":           str(job.id),
                "title":            job.title,
                "description":      job.description,
                "required_skills":  job.required_skills,
                "preferred_skills": job.preferred_skills,
                "experience_required": job.experience_required,
                "matched_skills":   list(common),
                "match_score":      score,
                "reason":           f"You know: {', '.join(common)}"
            })

    # 4. Sort by match score
    matched.sort(key=lambda x: x["match_score"], reverse=True)

    if not matched:
        return {"message": "No matching jobs found for your skills", "jobs": []}

    return {
        "candidate_name":   f"{candidate.first_name} {candidate.last_name}",
        "your_skills":      list(candidate_skills),
        "total_matches":    len(matched),
        "recommended_jobs": matched
    }


@router.get("/{job_id}")
async def view_job_description(job_id: str):
    """
    GET /api/v1/jobs/{job_id}
    Returns full job description. Public — no token needed.
    """
    try:
        oid = PydanticObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    job = await Job.get(oid)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return job_to_dict(job)


# get applicants count from job id 
@router.get("/{job_id}/applicants-count")
async def get_applicants_count(job_id: str):
    try:
        oid = PydanticObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job ID")

    job = await Job.get(oid)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    applicants_count = len(job.applicants)
    return {
        "job_id": job_id,
        "applicants_count": applicants_count
    }