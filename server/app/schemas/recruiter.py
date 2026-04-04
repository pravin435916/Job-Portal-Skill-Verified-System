from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class JobType(str, Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    internship = "internship"


class JobMode(str, Enum):
    onsite = "onsite"
    remote = "remote"
    hybrid = "hybrid"


class RecruiterProfileUpsert(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    company: str = Field(..., min_length=2, max_length=120)


class RecruiterProfileResponse(BaseModel):
    recruiter_id: str
    name: str
    email: EmailStr
    company: str


class RecruiterJobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10)
    company_name: str
    location: str
    job_type: JobType = JobType.full_time
    job_mode: JobMode = JobMode.onsite
    required_skills: list[str] = Field(..., min_items=1)
    preferred_skills: list[str] = []
    experience_required: str = "0 years"
    salary_range: Optional[str] = None
    openings: int = Field(default=1, ge=1)
    application_deadline: Optional[datetime] = None


class RecruiterJobUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=100)
    description: Optional[str] = Field(default=None, min_length=10)
    company_name: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    job_mode: Optional[JobMode] = None
    required_skills: Optional[list[str]] = Field(default=None, min_items=1)
    preferred_skills: Optional[list[str]] = None
    experience_required: Optional[str] = None
    salary_range: Optional[str] = None
    openings: Optional[int] = Field(default=None, ge=1)
    application_deadline: Optional[datetime] = None


class RecruiterJobResponse(BaseModel):
    job_id: str
    recruiter_id: Optional[str]
    title: str
    description: str
    company_name: str
    location: str
    job_type: JobType
    job_mode: JobMode
    required_skills: list[str]
    preferred_skills: list[str]
    experience_required: str
    salary_range: Optional[str]
    openings: int
    application_deadline: Optional[datetime]
    applicants_count: int
