from app.models.candidate import Candidate, Project, Education, Experience
from fastapi import HTTPException
from beanie import PydanticObjectId
import asyncio


# ---------------- Candidate ----------------
async def create_candidate(data: Candidate):
    await data.insert()
    return data


async def update_candidate(candidate_id: str, data):
    candidate = await Candidate.get(candidate_id)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    update_data = data.dict(exclude_unset=True, exclude_none=True)

    await candidate.update({"$set": update_data})
    # await candidate.fetch()

    return candidate


async def get_candidate(candidate_id: str):
    candidate = await Candidate.get(candidate_id)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return candidate


# ---------------- Project ----------------
async def add_project(candidate_id: str, data):
    candidate = await Candidate.get(candidate_id)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    project = Project(**data, candidate_id=candidate.id)

    await project.insert()
    return project


async def get_projects(candidate_id: str):
    return await Project.find(
        Project.candidate_id == PydanticObjectId(candidate_id)
    ).to_list()


async def update_project(project_id: str, data):
    project = await Project.get(project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = data.dict(exclude_unset=True, exclude_none=True)

    await project.update({"$set": update_data})
    await project.fetch()

    return project


async def delete_project(project_id: str):
    project = await Project.get(project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await project.delete()
    return {"message": "Project deleted"}


# ---------------- Education ----------------
async def add_education(candidate_id: str, data):
    candidate = await Candidate.get(candidate_id)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    education = Education(**data, candidate_id=candidate.id)

    await education.insert()
    return education


async def get_education(candidate_id: str):
    return await Education.find(
        Education.candidate_id == PydanticObjectId(candidate_id)
    ).to_list()


async def delete_education(education_id: str):
    education = await Education.get(education_id)

    if not education:
        raise HTTPException(status_code=404, detail="Education not found")

    await education.delete()
    return {"message": "Education deleted"}


# ---------------- Experience ----------------
async def add_experience(candidate_id: str, data):
    candidate = await Candidate.get(candidate_id)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    experience = Experience(**data, candidate_id=candidate.id)

    await experience.insert()
    return experience


async def get_experience(candidate_id: str):
    return await Experience.find(
        Experience.candidate_id == PydanticObjectId(candidate_id)
    ).to_list()


async def delete_experience(experience_id: str):
    experience = await Experience.get(experience_id)

    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")

    await experience.delete()
    return {"message": "Experience deleted"}


# ---------------- Full Profile ----------------
async def get_full_profile(candidate_id: str):
    candidate = await Candidate.get(candidate_id)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # 🔥 parallel execution (fast)
    projects_task = Project.find(
        Project.candidate_id == candidate.id
    ).to_list()

    education_task = Education.find(
        Education.candidate_id == candidate.id
    ).to_list()

    experience_task = Experience.find(
        Experience.candidate_id == candidate.id
    ).to_list()

    projects, education, experience = await asyncio.gather(
        projects_task,
        education_task,
        experience_task
    )

    return {
        **candidate.dict(),
        "projects": projects,
        "education": education,
        "experience": experience
    }