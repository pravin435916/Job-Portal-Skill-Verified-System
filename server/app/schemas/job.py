from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class JobType(str, Enum):
    full_time = "full_time"
    part_time = "part_time"
    internship = "internship"
    contract = "contract"


class JobMode(str, Enum):
    remote = "remote"
    onsite = "onsite"
    hybrid = "hybrid"


class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10)
    company_name: str
    location: str
    job_type: JobType = JobType.full_time
    job_mode: JobMode = JobMode.onsite
    required_skills: List[str] = Field(..., min_items=1)
    preferred_skills: List[str] = []
    experience_required: str = "0 years"
    salary_range: Optional[str] = None
    openings: int = Field(default=1, ge=1)
    application_deadline: Optional[datetime] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    job_mode: Optional[JobMode] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    experience_required: Optional[str] = None
    salary_range: Optional[str] = None
    openings: Optional[int] = None
    application_deadline: Optional[datetime] = None
    is_active: Optional[bool] = None


class JobResponse(BaseModel):
    job_id: str
    title: str
    description: str
    company_name: str
    location: str
    job_type: JobType
    job_mode: JobMode
    required_skills: List[str]
    preferred_skills: List[str]
    experience_required: str
    salary_range: Optional[str]
    openings: int
    recruiter_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    application_deadline: Optional[datetime]
    applicants: List[str]