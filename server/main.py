from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.db import connect_db, close_db

app = FastAPI(title="Skill Verified Job Portal")

@app.on_event("startup")
async def start_db():
    await init_db()


app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"msg": "API Running 🚀"}