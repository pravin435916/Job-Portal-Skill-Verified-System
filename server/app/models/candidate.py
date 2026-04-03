from beanie import Document, PydanticObjectId
from typing import Any, Dict, List, Optional

# ---------------- Candidate ----------------
class Candidate(Document):
    first_name: str
    last_name: str
    email: str
    bio: Optional[str] = None
    resume: Optional[str] = None
    phone_number: Optional[str] = None
    skills: Optional[List[str]] = None
    # Some records store these profile sections embedded on the candidate document.
    projects: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    github_link: Optional[str] = None
    leetcode_link: Optional[str] = None
    class Settings:
        name = "candidates"


# ---------------- Project ----------------
class Project(Document):
    candidate_id: PydanticObjectId   
    title: str
    desc: str
    link: str
    skills: List[str]
    media_link: Optional[List[str]] = None

    class Settings:
        name = "projects"


# ---------------- Education ----------------
class Education(Document):
    candidate_id: PydanticObjectId   # 🔥 LINK
    institution: str
    degree: str
    field_of_study: str
    cgpa: float
    start_date: str
    end_date: Optional[str] = None

    class Settings:
        name = "education"


# ---------------- Experience ----------------
class Experience(Document):
    candidate_id: PydanticObjectId   # 🔥 LINK
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    description: str
    
    class Settings:
        name = "experience"