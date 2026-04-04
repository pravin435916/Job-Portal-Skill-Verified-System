from fastapi import APIRouter
from app.services import candidate_service
from app.models.candidate import Candidate
from app.schemas.candidate import (
    CandidateUpdate,
    ProjectUpdate,
    EducationUpdate,
    ExperienceUpdate,
)

router = APIRouter()


# ---------------- Candidate ----------------
@router.post("/create")
async def create_candidate(data: Candidate):
    return await candidate_service.create_candidate(data)


@router.patch("/update/{candidate_id}")
async def update_candidate(candidate_id: str, data: CandidateUpdate):
    return await candidate_service.update_candidate(candidate_id, data)


@router.get("/get/{candidate_id}")
async def get_candidate(candidate_id: str):
    return await candidate_service.get_candidate(candidate_id)


# ---------------- Project ----------------
@router.post("/{candidate_id}/projects")
async def add_project(candidate_id: str, data: dict):
    return await candidate_service.add_project(candidate_id, data)


@router.get("/{candidate_id}/projects")
async def get_projects(candidate_id: str):
    return await candidate_service.get_projects(candidate_id)


@router.patch("/projects/{project_id}")
async def update_project(project_id: str, data: ProjectUpdate):
    return await candidate_service.update_project(project_id, data)


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    return await candidate_service.delete_project(project_id)


# ---------------- Education ----------------
@router.post("/{candidate_id}/education")
async def add_education(candidate_id: str, data: dict):
    return await candidate_service.add_education(candidate_id, data)


@router.get("/{candidate_id}/education")
async def get_education(candidate_id: str):
    return await candidate_service.get_education(candidate_id)


@router.delete("/education/{education_id}")
async def delete_education(education_id: str):
    return await candidate_service.delete_education(education_id)


@router.patch("/education/{education_id}")
async def update_education(education_id: str, data: EducationUpdate):
    return await candidate_service.update_education(education_id, data)


# ---------------- Experience ----------------
@router.post("/{candidate_id}/experience")
async def add_experience(candidate_id: str, data: dict):
    return await candidate_service.add_experience(candidate_id, data)


@router.get("/{candidate_id}/experience")
async def get_experience(candidate_id: str):
    return await candidate_service.get_experience(candidate_id)


@router.delete("/experience/{experience_id}")
async def delete_experience(experience_id: str):
    return await candidate_service.delete_experience(experience_id)


@router.patch("/experience/{experience_id}")
async def update_experience(experience_id: str, data: ExperienceUpdate):
    return await candidate_service.update_experience(experience_id, data)


# ---------------- Full Profile ----------------
@router.get("/profile/{candidate_id}")
async def get_profile(candidate_id: str):
    return await candidate_service.get_full_profile(candidate_id)
