from typing import List, Optional

from pydantic import BaseModel
from app.models.candidate import Project, Education, Experience

class CandidateUpdate(BaseModel):
    first_name:Optional[str]=None
    last_name:Optional[str]=None
    email: Optional[str]=None
    bio: Optional[str] = None
    resume: Optional[str] = None
    phone_number: Optional[str] = None
    skills: Optional[List[str]] = None
    github_link: Optional[str] = None
    leetcode_link: Optional[str] = None
    projects: Optional[List[Project]]=None
    education: Optional[List[Education]]=None
    experience: Optional[List[Experience]]=None

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


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    desc: Optional[str] = None
    link: Optional[str] = None
    skills: Optional[List[str]] = None
    media_link: Optional[List[str]] = None


class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    cgpa: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ExperienceUpdate(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
