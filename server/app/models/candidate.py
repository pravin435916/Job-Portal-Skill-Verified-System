from pydantic import BaseModel
from typing import List, Optional
from beanie import Document

class Project(BaseModel):
    title:str
    desc:str
    link:str
    skills:List[str]
    media_link:Optional[List[str]]=None

class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    cgpa: float
    start_date: str
    end_date: Optional[str] = None

class Experience(BaseModel):
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    description: str


class Candidate(Document):
    first_name: str
    last_name: str
    email: str
    bio: Optional[str] = None
    resume: Optional[str] = None
    phone_number: Optional[str] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[Project]]=None
    education: Optional[List[Education]]=None
    experience: Optional[List[Experience]]=None
    class Settings:
        name = "candidates"