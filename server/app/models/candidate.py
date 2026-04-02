from pydantic import BaseModel
from typing import List, Optional

class CandidateCreate(BaseModel):
    name: str
    skills: List[str]
    projects: Optional[List[dict]] = []