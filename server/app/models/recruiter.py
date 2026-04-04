from beanie import Document
from pydantic import EmailStr, Field


class Recruiter(Document):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    company: str = Field(..., min_length=2, max_length=120)

    class Settings:
        name = "recruiters"
