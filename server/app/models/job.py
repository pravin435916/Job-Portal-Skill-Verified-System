from beanie import Document
from typing import List, Dict

class Job(Document):
    title:               str
    description:         str
    required_skills: List[str]
    preferred_skills:    List[str]
    experience_required: str
    applicants:          List[str] = []  

    class Settings:
        name = "jobs"