from beanie import Document
from typing import List, Dict
from pydantic import Field

class Job(Document):
    title:               str
    description:         str
    required_skills: List[str]
    preferred_skills:    List[str]
    experience_required: str
    applicants:          List[str] = Field(default_factory=list)

    class Settings:
        name = "jobs"