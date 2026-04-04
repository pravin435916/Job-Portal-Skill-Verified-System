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
export const getCandidateProfile = (candidateId: string) =>
  API.get(`/candidate/profile/${candidateId}`);

export const updateCandidate = (candidateId: string, data: unknown) =>
  API.patch(`/candidate/update/${candidateId}`, data);

export const addProject = (candidateId: string, data: unknown) =>
  API.post(`/candidate/${candidateId}/projects`, data);

export const updateProject = (projectId: string, data: unknown) =>
  API.patch(`/candidate/projects/${projectId}`, data);

export const deleteProject = (projectId: string) =>
  API.delete(`/candidate/projects/${projectId}`);

export const addEducation = (candidateId: string, data: unknown) =>
  API.post(`/candidate/${candidateId}/education`, data);

export const updateEducation = (educationId: string, data: unknown) =>
  API.patch(`/candidate/education/${educationId}`, data);

export const deleteEducation = (educationId: string) =>
  API.delete(`/candidate/education/${educationId}`);

export const addExperience = (candidateId: string, data: unknown) =>
  API.post(`/candidate/${candidateId}/experience`, data);

export const updateExperience = (experienceId: string, data: unknown) =>
  API.patch(`/candidate/experience/${experienceId}`, data);

export const deleteExperience = (experienceId: string) =>
  API.delete(`/candidate/experience/${experienceId}`);
