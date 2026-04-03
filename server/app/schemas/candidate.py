from pydantic import BaseModel
from typing import Optional, List
from app.models.candidate import Project, Education, Experience

class CandidateUpdate(BaseModel):
    first_name:Optional[str]=None
    last_name:Optional[str]=None
    email: Optional[str]=None
    bio: Optional[str] = None
    resume: Optional[str] = None
    phone_number: Optional[str] = None
    skills: Optional[List[str]] = None
    projects: Optional[List[Project]]=None
    education: Optional[List[Education]]=None
    experience: Optional[List[Experience]]=None
