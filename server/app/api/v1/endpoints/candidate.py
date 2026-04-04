from fastapi import APIRouter, HTTPException
from app.services import candidate_service
from app.models.candidate import Candidate
from app.schemas.candidate import (
    CandidateUpdate,
    ProjectUpdate,
    EducationUpdate,
    ExperienceUpdate,
)
from pydantic import BaseModel
from typing import Optional
import os
import uuid
import boto3
from botocore.client import Config
from botocore.exceptions import BotoCoreError, ClientError

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


class ProjectMediaPresignRequest(BaseModel):
    filename: str
    content_type: Optional[str] = None


@router.post("/projects/presign")
async def presign_project_media_upload(payload: ProjectMediaPresignRequest):
    bucket = os.getenv("AWS_S3_BUCKET")
    region = os.getenv("AWS_REGION")
    cdn_domain = os.getenv("CLOUDFRONT_DOMAIN")
    expires = int(os.getenv("S3_PRESIGN_EXPIRES", "900"))

    if not bucket or not region:
        raise HTTPException(
            status_code=500,
            detail="AWS_S3_BUCKET and AWS_REGION must be set on the server",
        )

    ext = os.path.splitext(payload.filename)[1].lower()
    key = f"projects/{uuid.uuid4().hex}{ext}"
    content_type = payload.content_type or "application/octet-stream"

    try:
        s3 = boto3.client(
            "s3",
            region_name=region,
            endpoint_url=f"https://s3.{region}.amazonaws.com",
            config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
        )
        upload_url = s3.generate_presigned_url(
            "put_object",
            Params={"Bucket": bucket, "Key": key, "ContentType": content_type},
            ExpiresIn=expires,
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=500, detail="Failed to generate presigned URL") from exc

    if cdn_domain:
        cdn_url = f"https://{cdn_domain}/{key}"
    else:
        cdn_url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"

    return {"upload_url": upload_url, "key": key, "cdn_url": cdn_url}


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
