from beanie import Document
from typing import List, Dict

class Candidate(Document):
    name: str
    email: str
    skills: List[Dict]
    projects: List[Dict]
    resume: Dict
    activity: Dict

    class Settings:
        name = "candidates"