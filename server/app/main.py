from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.seed import seed_data
from app.core.db import init_db

app = FastAPI(title="Skill Verified Job Portal")

@app.on_event("startup")
async def on_startup():
    await init_db()


app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"msg": "API Running 🚀"}