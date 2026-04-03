from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ApplicationStatusUpdateRequest(BaseModel):
    status: str
    interview_at: Optional[datetime] = None
    interview_mode: Optional[str] = None
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    score: Optional[float] = None
    status: str
    interview_at: Optional[datetime] = None
    interview_mode: Optional[str] = None
    notes: Optional[str] = None
