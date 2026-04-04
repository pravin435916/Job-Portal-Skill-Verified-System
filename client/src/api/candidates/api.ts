import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

export const DEFAULT_CANDIDATE_ID = "69cf903ef82584c496f3a08c";

export const getAllJobs = () => API.get("/jobs/");

export const getRecommendedJobs = (candidateId: string = DEFAULT_CANDIDATE_ID) =>
  API.get(`/jobs/recommend/${candidateId || DEFAULT_CANDIDATE_ID}`);

export const applyToJob = (jobId: string, candidateId: string) =>
  API.post("/applications/", {
    job_id: jobId,
    candidate_id: candidateId,
  });

export const getMyApplications = (candidateId: string) =>
  API.get(`/applications/my/${candidateId}`);

export const getApplicantsCount = (jobId: string) =>
  API.get(`/jobs/${jobId}/applicants-count`);
