from app.models.candidate import Candidate
from app.models.job import Job

async def seed_data():

    # ✅ FIXED CANDIDATES
    candidates = [
        Candidate(
            first_name="Pravin",
            last_name="Patil",
            email="pravin@gmail.com",
            bio="Full stack developer",
            phone_number="9876543210",
            skills=["React", "MongoDB"],

            projects=[
                {
                    "title": "Job Portal",
                    "desc": "Full stack job portal",
                    "link": "https://github.com/pravin/job-portal",
                    "skills": ["React", "MongoDB"],
                    "media_link": []
                }
            ],

            education=[
                {
                    "institution": "XYZ College",
                    "degree": "B.Tech",
                    "field_of_study": "Computer Science",
                    "cgpa": 8.5,
                    "start_date": "2021",
                    "end_date": "2025"
                }
            ],

            experience=[]
        ),

        Candidate(
            first_name="Rahul",
            last_name="Sharma",
            email="rahul@gmail.com",
            bio="Data analyst",
            phone_number="9876500000",
            skills=["Python", "Data Analysis"],

            projects=[
                {
                    "title": "Sales Data Analysis",
                    "desc": "Analyzed sales data",
                    "link": "https://github.com/rahul/data-analysis",
                    "skills": ["Python", "Pandas"],
                    "media_link": []
                }
            ],

            education=[],
            experience=[]
        )
    ]
    jobs = [
    {
        "title": "Frontend Developer",
        "description": "Looking for React developer",
        "required_skills": [
            {"name": "React", "weight": 0.5},
            {"name": "MongoDB", "weight": 0.3}
        ],
        "preferred_skills": ["Redux"],
        "experience_required": "Fresher"
    },
    {
        "title": "Backend Developer",
        "description": "Looking for Python developer",
        "required_skills": [
            {"name": "Python", "weight": 0.6},
            {"name": "FastAPI", "weight": 0.4}
        ],
        "preferred_skills": ["Docker"],
        "experience_required": "Fresher"
    }
]
    if await Candidate.count() == 0:
       await Candidate.insert_many(candidates)

    if await Job.count() == 0:
        await Job.insert_many([Job(**job) for job in jobs])

    print("🌱 Seed data inserted")


