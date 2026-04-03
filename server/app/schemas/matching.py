from pydantic import BaseModel
from typing import List

class CandidateScore(BaseModel):
    candidate_id: str
    name: str
    final_score: float