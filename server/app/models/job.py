from datetime import datetime
from typing import List, Optional
from beanie import Document, Indexed
from pydantic import Field


class Job(Document):
    title: str
    description: str
    company_name: str
    location: str
    job_type: str
    job_mode: str
    required_skills: List[str]
    preferred_skills: List[str] = []
    experience_required: str = "0 years"
    salary_range: Optional[str] = None
    openings: int = 1
    recruiter_id: str = Indexed()      # indexed for fast lookup by recruiter
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    application_deadline: Optional[datetime] = None
    applicants:List[str]=Field(default_factory=list)
    
    class Settings:
        name = "jobs"                # MongoDB collection name
        indexes = [
            "required_skills",
            "is_active",
            "recruiter_id",
        ]