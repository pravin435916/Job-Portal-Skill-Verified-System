# app/services/application_service.py
# ADD this function first

from app.models.job import Job

def _job_to_dict(doc) -> dict:
    return {
        "job_id":              str(doc.id),
        "title":               doc.title,
        "description":         doc.description,
        "required_skills":     doc.required_skills,
        "preferred_skills":    doc.preferred_skills,
        "experience_required": doc.experience_required,
    }

async def fetch_all_jobs(search: str = None, skill: str = None, role: str = None):
    all_jobs = await Job.find_all().to_list()
    results  = []

    for job in all_jobs:
        title = job.title.lower()

        if role and role.lower() not in title:
            continue
        if search:
            desc = (job.description or "").lower()
            if search.lower() not in title and search.lower() not in desc:
                continue
        if skill:
            skill_names = [s.get("name", "").lower() for s in job.required_skills]
            if skill.lower() not in skill_names:
                continue

        results.append(_job_to_dict(job))

    return results