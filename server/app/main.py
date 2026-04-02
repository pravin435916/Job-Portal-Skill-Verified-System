from fastapi import FastAPI
from app.api.v1.router import api_router

app = FastAPI(title="Skill Verified Job Portal")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"msg": "API Running 🚀"}