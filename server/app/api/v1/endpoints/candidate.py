from fastapi import APIRouter
from app.services import candidate_service
from app.models.candidate import Candidate

router = APIRouter()

@router.post("/create")
async def create_candidate(data):
    candidate = candidate_service.create_candidate(data)
    return candidate

@router.put("/update/{candidate_id}")
async def update_candidate(candidate_id: str, data: Candidate):
    candidate = candidate_service.update_candidate(candidate_id, data)
    return candidate

@router.get("/get/{candidate_id}")
async def get_candidate(candidate_id: str):
    candidate = candidate_service.get_candidate(candidate_id)
    return candidate