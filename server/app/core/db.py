import motor
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv
from app.models.candidate import Candidate
# from app.models.application import Application
# from app.models.job import Job


load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")


async def init_db():
    client = AsyncIOMotorClient(MONGO_URL)

    await init_beanie(database=client.get_database(), document_models=[Candidate])
