from typing import Optional

from app.models.candidate import Candidate


def _serialize(value):
    if hasattr(value, "model_dump"):
        return value.model_dump()
    if hasattr(value, "dict"):
        return value.dict()
    return value


def to_candidate_response(candidate: Candidate) -> dict:
    return {
        "id": str(candidate.id),
        "first_name": candidate.first_name,
        "last_name": candidate.last_name,
        "email": candidate.email,
        "bio": candidate.bio,
        "resume": candidate.resume,
        "phone_number": candidate.phone_number,
        "skills": candidate.skills,
        "projects": [_serialize(project) for project in (candidate.projects or [])] or None,
        "education": [_serialize(education) for education in (candidate.education or [])] or None,
        "experience": [_serialize(experience) for experience in (candidate.experience or [])] or None,
    }


async def get_candidate_by_id(candidate_id: str) -> Optional[Candidate]:
    return await Candidate.get(candidate_id)
