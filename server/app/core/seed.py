from app.core.db import mongodb


async def seed_data():
    # candidates
    candidates = [
        {
            "name": "Pravin",
            "email": "pravin@gmail.com",
            "skills": [{"name": "React"}, {"name": "MongoDB"}],
            "projects": [
                {
                    "title": "Job Portal",
                    "tech_stack": ["React", "MongoDB"],
                    "verified": True
                }
            ],
            "resume": {
                "extracted_skills": ["React", "Node"]
            },
            "activity": {
                "github_commits": 100,
                "last_active_days": 2
            }
        },
        { # data analyst
            "name": "Rahul",
            "email": "rahul@gmail.com",
            "skills": [{"name": "Python"}, {"name": "Data Analysis"}],
            "projects": [
                {
                    "title": "Sales Data Analysis",
                    "tech_stack": ["Python", "Pandas"],
                    "verified": True
                }
            ],
            "resume": {
                "extracted_skills": ["Python", "SQL"]
            },
            "activity": {
                "github_commits": 50,
                "last_active_days": 5
            }
        }
    ]

    # jobs
    jobs = [
        {
            "title": "Frontend Developer",
            "description": "Looking for React developer with MongoDB knowledge",

            "required_skills": [
                {"name": "React", "weight": 0.5},
                {"name": "MongoDB", "weight": 0.3}
            ],

            "preferred_skills": ["Redux", "TypeScript"],
            "experience_required": "Fresher"
        },

        {
            "title": "Backend Developer",
            "description": "Looking for FastAPI and Python developer",

            "required_skills": [
                {"name": "Python", "weight": 0.5},
                {"name": "FastAPI", "weight": 0.4}
            ],

            "preferred_skills": ["Docker", "Redis"],
            "experience_required": "Fresher"
        },

        {
            "title": "Full Stack Developer",
            "description": "Looking for MERN stack developer",

            "required_skills": [
                {"name": "React", "weight": 0.4},
                {"name": "Node", "weight": 0.4},
                {"name": "MongoDB", "weight": 0.2}
            ],

            "preferred_skills": ["Next.js"],
            "experience_required": "Fresher"
        }
    ]

    # insert if empty
    if await mongodb.db.candidates.count_documents({}) == 0:
        await mongodb.db.candidates.insert_many(candidates)

    if await mongodb.db.jobs.count_documents({}) == 0:
        await mongodb.db.jobs.insert_many(jobs)

    print("🌱 Seed data inserted")