import logging
import re
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Set

from bson import ObjectId

from app.models.application import Application
from app.models.candidate import Candidate, Education, Experience, Project
from app.models.job import Job
from app.models.job_ranking import JobRanking

logger = logging.getLogger(__name__)


HEX_OBJECT_ID_RE = re.compile(r"^[0-9a-fA-F]{24}$")


def _normalize_candidate_id(raw_id) -> Optional[str]:
    if raw_id is None:
        return None

    if isinstance(raw_id, ObjectId):
        return str(raw_id)

    if isinstance(raw_id, dict):
        oid = raw_id.get("$oid")
        if isinstance(oid, str) and HEX_OBJECT_ID_RE.fullmatch(oid.strip()):
            return oid.strip()
        return None

    text = str(raw_id).strip()
    if HEX_OBJECT_ID_RE.fullmatch(text):
        return text

    # Handle values like ObjectId("...") or ObjectId('...').
    match = re.search(r"([0-9a-fA-F]{24})", text)
    return match.group(1) if match else None


def _job_applicant_ids(job: Job) -> List[str]:
    cleaned_ids: List[str] = []
    seen: Set[str] = set()

    for raw in job.applicants or []:
        normalized = _normalize_candidate_id(raw)
        if not normalized:
            logger.warning("Skipping invalid applicant ID in job %s: %r", str(job.id), raw)
            continue
        if normalized in seen:
            continue
        seen.add(normalized)
        cleaned_ids.append(normalized)

    return cleaned_ids

# ── Skill extraction ───────────────────────────────────────────────────────────

def _extract_job_skill_names(job: Job) -> Set[str]:
    names: Set[str] = set()
    for skill in job.required_skills or []:
        name = skill.get("name", "").strip().lower() if isinstance(skill, dict) else str(skill).strip().lower()
        if name:
            names.add(name)
    return names


def _extract_candidate_skill_names(candidate: Candidate) -> Set[str]:
    names: Set[str] = set()
    for skill in candidate.skills or []:
        value = skill.get("name", "").strip().lower() if isinstance(skill, dict) else str(skill).strip().lower()
        if value:
            names.add(value)
    return names


def _candidate_list_field(candidate: Candidate, field_name: str, profile_data: Optional[dict] = None) -> list:
    if profile_data:
        hydrated_value = profile_data.get(field_name)
        if isinstance(hydrated_value, list) and hydrated_value:
            return hydrated_value

    value = getattr(candidate, field_name, None)
    return value if isinstance(value, list) else []


async def _build_candidate_profile_map(candidates: List[Candidate]) -> Dict[str, dict]:
    candidate_object_ids = [candidate.id for candidate in candidates if getattr(candidate, "id", None)]
    profile_map: Dict[str, dict] = {
        str(candidate.id): {"projects": [], "education": [], "experience": []}
        for candidate in candidates
        if getattr(candidate, "id", None)
    }

    if not candidate_object_ids:
        return profile_map

    try:
        projects_task = Project.find({"candidate_id": {"$in": candidate_object_ids}}).to_list()
        education_task = Education.find({"candidate_id": {"$in": candidate_object_ids}}).to_list()
        experience_task = Experience.find({"candidate_id": {"$in": candidate_object_ids}}).to_list()

        projects, education, experience = await asyncio.gather(
            projects_task,
            education_task,
            experience_task,
        )
    except Exception as exc:
        logger.warning("Failed to fetch related profile docs for ranking: %s", exc)
        return profile_map

    for item in projects:
        profile_map.setdefault(str(item.candidate_id), {"projects": [], "education": [], "experience": []})["projects"].append(item)

    for item in education:
        profile_map.setdefault(str(item.candidate_id), {"projects": [], "education": [], "experience": []})["education"].append(item)

    for item in experience:
        profile_map.setdefault(str(item.candidate_id), {"projects": [], "education": [], "experience": []})["experience"].append(item)

    return profile_map


def _serialize_profile_lists(candidate: Candidate, profile_data: Optional[dict]) -> dict:
    projects = _candidate_list_field(candidate, "projects", profile_data)
    education = _candidate_list_field(candidate, "education", profile_data)
    experience = _candidate_list_field(candidate, "experience", profile_data)

    return {
        "projects": [
            {
                "id": str(getattr(item, "id", "")) if not isinstance(item, dict) else str(item.get("id", "")),
                "title": getattr(item, "title", None) if not isinstance(item, dict) else item.get("title"),
                "skills": list(getattr(item, "skills", []) or []) if not isinstance(item, dict) else list(item.get("skills") or []),
                "desc": getattr(item, "desc", None) if not isinstance(item, dict) else item.get("desc"),
                "link": getattr(item, "link", None) if not isinstance(item, dict) else item.get("link"),
            }
            for item in projects
        ],
        "education": [
            {
                "id": str(getattr(item, "id", "")) if not isinstance(item, dict) else str(item.get("id", "")),
                "institution": getattr(item, "institution", None) if not isinstance(item, dict) else item.get("institution"),
                "degree": getattr(item, "degree", None) if not isinstance(item, dict) else item.get("degree"),
                "field_of_study": getattr(item, "field_of_study", None) if not isinstance(item, dict) else item.get("field_of_study"),
                "cgpa": getattr(item, "cgpa", None) if not isinstance(item, dict) else item.get("cgpa"),
                "start_date": getattr(item, "start_date", None) if not isinstance(item, dict) else item.get("start_date"),
                "end_date": getattr(item, "end_date", None) if not isinstance(item, dict) else item.get("end_date"),
            }
            for item in education
        ],
        "experience": [
            {
                "id": str(getattr(item, "id", "")) if not isinstance(item, dict) else str(item.get("id", "")),
                "company": getattr(item, "company", None) if not isinstance(item, dict) else item.get("company"),
                "position": getattr(item, "position", None) if not isinstance(item, dict) else item.get("position"),
                "description": getattr(item, "description", None) if not isinstance(item, dict) else item.get("description"),
                "start_date": getattr(item, "start_date", None) if not isinstance(item, dict) else item.get("start_date"),
                "end_date": getattr(item, "end_date", None) if not isinstance(item, dict) else item.get("end_date"),
            }
            for item in experience
        ],
    }


# ── Scoring ────────────────────────────────────────────────────────────────────

def _score_skills(candidate: Candidate, required_skills: Set[str]) -> dict:
    if not required_skills:
        return {"score": 0.0, "matched": [], "missing": []}
    candidate_skills = _extract_candidate_skill_names(candidate)
    matched = sorted(candidate_skills & required_skills)
    missing = sorted(required_skills - candidate_skills)
    score = round((len(matched) / len(required_skills)) * 100, 2)
    return {"score": score, "matched": matched, "missing": missing}


def _score_projects(candidate: Candidate, required_skills: Set[str], profile_data: Optional[dict] = None) -> dict:
    projects = _candidate_list_field(candidate, "projects", profile_data)
    if not required_skills or not projects:
        return {"score": 0.0, "matched_in_projects": []}

    total = 0.0
    matched_in_projects = []

    for project in projects:
        if isinstance(project, dict):
            project_skills = set(s.lower() for s in (project.get("skills") or []))
            title = project.get("title") or project.get("name", "Untitled")
        else:
            project_skills = set(s.lower() for s in (getattr(project, "skills", None) or []))
            title = getattr(project, "title", None) or getattr(project, "name", "Untitled")

        hits = project_skills & required_skills
        if hits:
            total += len(hits) * 10
            matched_in_projects.append({
                "project": title,
                "matched_skills": sorted(hits),
            })

    return {"score": round(min(total, 100), 2), "matched_in_projects": matched_in_projects}


def _score_education(candidate: Candidate, profile_data: Optional[dict] = None) -> dict:
    education = _candidate_list_field(candidate, "education", profile_data)
    if not education:
        return {"score": 0.0, "detail": "No education listed"}

    CS_FIELDS = {
        "computer science", "information technology", "software engineering",
        "computer engineering", "data science", "artificial intelligence",
        "electronics", "information systems", "mathematics", "statistics",
    }
    TECH_DEGREES = {"b.tech", "m.tech", "b.e", "m.e", "b.sc", "m.sc", "mca", "bca", "phd"}

    best, detail = 0, ""
    for edu in education:
        if isinstance(edu, dict):
            field  = (edu.get("field_of_study") or edu.get("field") or "").lower()
            degree = (edu.get("degree") or "").lower()
        else:
            field  = (getattr(edu, "field_of_study", None) or getattr(edu, "field", None) or "").lower()
            degree = (getattr(edu, "degree", None) or "").lower()

        score = 40
        if any(f in field for f in CS_FIELDS):
            score += 40
        if any(d in degree for d in TECH_DEGREES):
            score += 20

        if score > best:
            best   = score
            detail = f"{degree} in {field}".strip(" in")

    return {"score": round(min(best, 100), 2), "detail": detail}


def _score_activity(candidate: Candidate, profile_data: Optional[dict] = None) -> dict:
    project_count    = len(_candidate_list_field(candidate, "projects", profile_data))
    experience_count = len(_candidate_list_field(candidate, "experience", profile_data))
    score = min(project_count * 15 + experience_count * 20, 100)
    return {"score": float(score), "source": "proxy"}


def _score_completeness(candidate: Candidate, profile_data: Optional[dict] = None) -> dict:
    fields = [
        ("first_name",   10),
        ("last_name",    10),
        ("bio",          10),
        ("skills",       20),
        ("projects",     20),
        ("education",    15),
        ("experience",   10),
        ("phone_number",  5),
    ]
    earned, missing = 0, []
    for field, weight in fields:
        value = _candidate_list_field(candidate, field, profile_data) if field in {"projects", "education", "experience"} else getattr(candidate, field, None)
        filled = bool(value.strip()) if isinstance(value, str) else bool(value) if isinstance(value, list) else value is not None
        if filled:
            earned += weight
        else:
            missing.append(field)
    return {"score": float(earned), "missing_fields": missing}


WEIGHTS = {
    "skills":       0.40,
    "projects":     0.30,
    "education":    0.15,
    "activity":     0.10,
    "completeness": 0.05,
}


def _calculate_final_score(candidate: Candidate, required_skills: Set[str], profile_data: Optional[dict] = None) -> dict:
    skill_result        = _score_skills(candidate, required_skills)
    project_result      = _score_projects(candidate, required_skills, profile_data)
    education_result    = _score_education(candidate, profile_data)
    activity_result     = _score_activity(candidate, profile_data)
    completeness_result = _score_completeness(candidate, profile_data)

    s = skill_result["score"]
    p = project_result["score"]
    e = education_result["score"]
    a = activity_result["score"]
    c = completeness_result["score"]

    bonus = 5 if not skill_result["missing"] and skill_result["matched"] else 0

    final = (
        s * WEIGHTS["skills"]       +
        p * WEIGHTS["projects"]      +
        e * WEIGHTS["education"]     +
        a * WEIGHTS["activity"]      +
        c * WEIGHTS["completeness"]  +
        bonus
    )

    return {
        "skill_score":         round(s, 2),
        "project_score":       round(p, 2),
        "education_score":     round(e, 2),
        "activity_score":      round(a, 2),
        "completeness_score":  round(c, 2),
        "bonus":               bonus,
        "final_score":         round(min(final, 100), 2),
        "matched_skills":      skill_result["matched"],
        "missing_skills":      skill_result["missing"],
        "matched_in_projects": project_result["matched_in_projects"],
        "education_detail":    education_result["detail"],
    }


# ── Application status ─────────────────────────────────────────────────────────

async def _attach_application_status(job_id: str, rankings: List[dict]) -> List[dict]:
    candidate_ids = [r["candidate_id"] for r in rankings]
    if not candidate_ids:
        return rankings
    try:
        applications = await Application.find(
            {"job_id": job_id, "candidate_id": {"$in": candidate_ids}}
        ).to_list()
        by_candidate = {app.candidate_id: app for app in applications}
    except Exception:
        by_candidate = {}

    return [
        {
            **r,
            "status":         by_candidate[r["candidate_id"]].status if r["candidate_id"] in by_candidate else r.get("status", "applied"),
            "application_id": str(by_candidate[r["candidate_id"]].id) if r["candidate_id"] in by_candidate else None,
        }
        for r in rankings
    ]


# ── Main ───────────────────────────────────────────────────────────────────────

async def match_rank_store_retrieve(
    job_id: str,
    min_score: float = 0,
    limit: int = 50,
) -> List[dict]:
    logger.info("Matching request job=%s min_score=%s limit=%s", job_id, min_score, limit)

    # 1. Fetch job first so we can validate cache freshness against applicant IDs.
    job = await Job.get(job_id)
    if not job:
        logger.warning("Job %s not found", job_id)
        return []

    candidate_ids = _job_applicant_ids(job)
    logger.info("Job %s — %d valid applicant ID(s): %s", job_id, len(candidate_ids), candidate_ids)

    if not candidate_ids:
        return []

    # 2. Cache lookup (write-through only).
    cached = await JobRanking.find_one(JobRanking.job_id == job_id)
    if cached and cached.rankings:
        logger.info("Skipping cache read for job %s to ensure fresh profile-based scoring", job_id)

    # 3. Fetch candidate documents
    object_ids = [ObjectId(cid) for cid in candidate_ids]

    candidates = await Candidate.find({"_id": {"$in": object_ids}}).to_list()
    logger.info("Fetched %d/%d candidate docs for job %s", len(candidates), len(candidate_ids), job_id)

    if not candidates:
        logger.warning("No candidate docs matched — check applicant IDs in job document")
        return []

    # 4. Score
    required_skills = _extract_job_skill_names(job)
    logger.info("Required skills for job %s: %s", job_id, required_skills)
    profile_map = await _build_candidate_profile_map(candidates)

    rankings = []
    for candidate in candidates:
        profile_data = profile_map.get(str(candidate.id))
        scores = _calculate_final_score(
            candidate,
            required_skills,
            profile_data,
        )
        profile_lists = _serialize_profile_lists(candidate, profile_data)
        rankings.append({
            "candidate_id": str(candidate.id),
            "name":         f"{candidate.first_name} {candidate.last_name}".strip(),
            "email":        candidate.email,
            "status":       "applied",
            **profile_lists,
            **scores,
        })

    rankings.sort(key=lambda r: r["final_score"], reverse=True)

    # 5. Cache full list
    try:
        if cached:
            await cached.set({"rankings": rankings, "last_updated": datetime.utcnow()})
        else:
            await JobRanking(job_id=job_id, rankings=rankings, last_updated=datetime.utcnow()).insert()
        logger.info("Cached %d rankings for job %s", len(rankings), job_id)
    except Exception as exc:
        logger.error("Cache write failed: %s", exc)

    # 6. Filter + limit in memory
    filtered = [r for r in rankings if r["final_score"] >= min_score]
    return await _attach_application_status(job_id, filtered[:limit])