from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.db import connect_db, close_db

app = FastAPI(title="Skill Verified Job Portal")

# Startup & Shutdown events
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"msg": "API Running 🚀"}