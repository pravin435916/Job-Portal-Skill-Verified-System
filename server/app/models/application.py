from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field


class Application(Document):
    job_id: str
    candidate_id: str
    score: Optional[float] = None
    status: str = ""
    applied_at:   Optional[datetime]      = None
    interview_at: Optional[datetime] = None
    interview_mode: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
