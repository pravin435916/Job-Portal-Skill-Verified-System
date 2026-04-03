import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

// Get all jobs
export const getJobs = () =>
  API.get("/jobs");

// Get ranked candidates for a job
export const getRankedCandidates = (
  jobId: string,
  minScore: number,
  limit: number,
) => API.get(`/jobs/${jobId}/candidates-ranked`, {
  params: { minScore, limit },
});

// Optional notifications endpoint used by recruiter dashboard
export const getNotifications = () =>
  API.get("/notifications");
