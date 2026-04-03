from beanie import Document
from typing import List, Dict
from datetime import datetime

class JobRanking(Document):
    job_id: str
    rankings: List[Dict]
    last_updated: datetime

    class Settings:
        name = "job_rankings"