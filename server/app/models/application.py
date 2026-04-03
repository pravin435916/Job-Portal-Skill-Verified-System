from beanie import Document
from typing import Optional
from datetime import datetime

class Application(Document):
    job_id:       str
    candidate_id: str
    status:       str                     = "applied"
    applied_at:   Optional[datetime]      = None

    class Settings:
        name = "applications"             # MongoDB collection name