from app.models.candidate import Candidate




async def create_candidate(data):
    candidate = Candidate(**data)
    await candidate.save()
    return candidate


async def update_candidate(candidate_id: str, data: Candidate):
    candidate = await Candidate.get(candidate_id)
    if not candidate:
        return None
    update_data = data.dict(exclude_unset=True)
    await candidate.update({"$set": update_data})
    return candidate


async def get_candidate(candidate_id: str):
    candidate = await Candidate.get(candidate_id)
    return candidate