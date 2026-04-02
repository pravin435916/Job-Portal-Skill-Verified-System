from app.core.db import db
from app.models.candidate import candidate_model

def create_candidate(data):
    candidate = candidate_model(data)
    db.candidates.insert_one(candidate)
    return candidate

def get_candidates():
    return list(db.candidates.find({}, {"_id": 0}))