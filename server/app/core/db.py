from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv

from app.models.candidate import Candidate, Project, Education, Experience
from app.models.job import Job
from app.models.job_ranking import JobRanking
from app.models.application import Application
from app.models.recruiter import Recruiter

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")


async def init_db():
    client = AsyncIOMotorClient(MONGO_URL)

    db = client[DB_NAME]   

    await init_beanie(
        database=db,
        document_models=[
            Candidate,
            Job,
            JobRanking,
            Application,
            Project,
            Education,
            Experience,
            Recruiter,
        ]
    )

    print("✅ Beanie connected")
