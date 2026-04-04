from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import Field, validator


class Job(Document):
    recruiter_id: Optional[str] = None
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10)
    company_name: str = "Unknown Company"
    location: str = "Remote"
    job_type: str = "full_time"
    job_mode: str = "onsite"
    required_skills: List[str] = Field(default_factory=list, min_items=1)
    preferred_skills: List[str] = Field(default_factory=list)
    experience_required: str = "0 years"
    salary_range: Optional[str] = None
    openings: int = Field(default=1, ge=1)
    application_deadline: Optional[datetime] = None
    applicants: List[str] = Field(default_factory=list)

    @validator("required_skills", "preferred_skills", pre=True)
    def normalize_skill_lists(cls, v):
        if v is None:
            return []

        normalized: list[str] = []
        for item in v:
            if isinstance(item, str):
                name = item.strip()
            elif isinstance(item, dict):
                name = str(item.get("name", "")).strip()
            else:
                name = ""

            if name:
                normalized.append(name)

        return normalized

    class Settings:
        name = "jobs"