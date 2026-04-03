from pydantic import BaseModel
from typing import Optional

class CandidateScore(BaseModel):
    candidate_id: str
    score: float
    status: str = "applied"
    application_id: Optional[str] = None
