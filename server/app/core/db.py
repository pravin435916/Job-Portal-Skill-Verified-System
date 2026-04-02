from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

mongodb = MongoDB()

async def connect_db():
    mongodb.client = AsyncIOMotorClient(settings.MONGO_URL)
    mongodb.db = mongodb.client[settings.DB_NAME]
    print("✅ MongoDB connected")

async def close_db():
    mongodb.client.close()
    print("❌ MongoDB disconnected")