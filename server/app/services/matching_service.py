from app.core.db import db

def match_candidates(job_id: str):
    job = db.jobs.find_one({"job_id": job_id})
    candidates = list(db.candidates.find())

    ranked = []

    for c in candidates:
        common = set(c.get("skills", [])) & set(job.get("required_skills", []))
        score = len(common) * 10

        ranked.append({
            "candidate_id": str(c.get("_id")),
            "score": score
        })

    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked