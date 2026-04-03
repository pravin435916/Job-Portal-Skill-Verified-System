from typing import List, Optional

from pydantic import BaseModel


class ProjectSchema(BaseModel):
    title: str
    desc: str
    link: str
    skills: List[str]
    media_link: Optional[List[str]] = None


class EducationSchema(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    cgpa: float
    start_date: str
    end_date: Optional[str] = None


class ExperienceSchema(BaseModel):
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    description: str


class CandidateResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    bio: Optional[str] = None
    resume: Optional[str] = None
    phone_number: Optional[str] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[ProjectSchema]] = None
    education: Optional[List[EducationSchema]] = None
    experience: Optional[List[ExperienceSchema]] = None
