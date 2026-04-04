import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
	applyToJob,
	DEFAULT_CANDIDATE_ID as DEFAULT_RECOMMEND_CANDIDATE_ID,
	getApplicantsCount,
	getMyApplications,
	getRecommendedJobs,
} from "../../api/candidates/api";

const CANDIDATE_ID_STORAGE_KEY = "candidate_id";
const DEFAULT_DEV_CANDIDATE_ID = "69cf903ef82584c496f3a08c";
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

type Skill = string | { name?: string };

type JobRecord = {
	job_id: string;
	title: string;
	description?: string;
	required_skills?: Skill[];
	preferred_skills?: Skill[];
	experience_required?: string;
	matched_skills?: string[];
	match_score?: number;
	reason?: string;
	applicants?: string[];
	location?: string;
};

type MyApplication = {
	application_id: string;
	job_id: string;
	job_title?: string;
	status: string;
	applied_at?: string;
};

type RecommendedJobsResponse =
	| { recommended_jobs?: JobRecord[] }
	| { jobs?: JobRecord[] };

const toSkillLabel = (skill: Skill): string => {
	if (typeof skill === "string") {
		return skill;
	}

	return skill.name ?? "Skill";
};

const formatStatusLabel = (value: string): string =>
	value.replace(/_/g, " ").replace(/^\w/, (char) => char.toUpperCase());

const statusColor = (value: string): string => {
	const key = value.toLowerCase();
	if (key === "shortlisted") {
		return "border-emerald-200 bg-emerald-50 text-emerald-700";
	}

	if (key === "rejected") {
		return "border-red-200 bg-red-50 text-red-700";
	}

	if (key === "interview_scheduled") {
		return "border-indigo-200 bg-indigo-50 text-indigo-700";
	}

	return "border-slate-200 bg-slate-50 text-slate-700";
};

export default function CandidateJobListing() {
	const [candidateId, setCandidateId] = useState<string>("");
	const [recommendedJobs, setRecommendedJobs] = useState<JobRecord[]>([]);
	const [applicantsCountByJobId, setApplicantsCountByJobId] = useState<
		Record<string, number>
	>({});
	const [applications, setApplications] = useState<MyApplication[]>([]);
	const [recommendedLoading, setRecommendedLoading] = useState<boolean>(false);
	const [appsLoading, setAppsLoading] = useState<boolean>(false);
	const [applyLoadingJobId, setApplyLoadingJobId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const refreshMyApplications = async (id: string) => {
		const response = await getMyApplications(id);
		setApplications((response.data as MyApplication[]) ?? []);
	};

	const refreshApplicantsCount = async (jobs: JobRecord[]) => {
		const counts = await Promise.all(
			jobs.map(async (job) => {
				try {
					const response = await getApplicantsCount(job.job_id);
					const data = response.data as {
						job_id?: string;
						applicants_count?: number;
					};
					return [job.job_id, data.applicants_count ?? 0] as const;
				} catch {
					return [job.job_id, job.applicants?.length ?? 0] as const;
				}
			}),
		);

		setApplicantsCountByJobId(Object.fromEntries(counts));
	};

	useEffect(() => {
		const cachedId = (localStorage.getItem(CANDIDATE_ID_STORAGE_KEY) ?? "").trim();
		if (OBJECT_ID_REGEX.test(cachedId)) {
			setCandidateId(cachedId);
			return;
		}

		// Ensure a valid fallback id is always available for local no-auth mode.
		localStorage.setItem(CANDIDATE_ID_STORAGE_KEY, DEFAULT_DEV_CANDIDATE_ID);
		setCandidateId(DEFAULT_DEV_CANDIDATE_ID);
	}, []);

	useEffect(() => {
		if (!candidateId) {
			setRecommendedJobs([]);
			setApplicantsCountByJobId({});
			setApplications([]);
			return;
		}

		let isActive = true;

		const loadCandidateData = async () => {
			setRecommendedLoading(true);
			setAppsLoading(true);
			setErrorMessage(null);

			try {
				const applicationsResponse = await getMyApplications(candidateId);
				if (isActive) {
					setApplications((applicationsResponse.data as MyApplication[]) ?? []);
				}
			} catch {
				if (isActive) {
					setApplications([]);
					setErrorMessage(
						"Unable to load My Applications from /applications/my/{candidate_id}.",
					);
				}
			} finally {
				if (isActive) {
					setAppsLoading(false);
				}
			}

			try {
				const preferredCandidateId = candidateId || DEFAULT_RECOMMEND_CANDIDATE_ID;
				let recommendedResponse = await getRecommendedJobs(preferredCandidateId);
				const recommendedData =
					recommendedResponse.data as RecommendedJobsResponse;
				let recommended =
					recommendedData && "recommended_jobs" in recommendedData
						? (recommendedData.recommended_jobs ?? [])
						: "jobs" in (recommendedData ?? {})
							? ((recommendedData as { jobs?: JobRecord[] }).jobs ?? [])
							: [];

				if (
					recommended.length === 0 &&
					preferredCandidateId !== DEFAULT_RECOMMEND_CANDIDATE_ID
				) {
					recommendedResponse = await getRecommendedJobs(DEFAULT_RECOMMEND_CANDIDATE_ID);
					const fallbackData =
						recommendedResponse.data as RecommendedJobsResponse;
					recommended =
						fallbackData && "recommended_jobs" in fallbackData
							? (fallbackData.recommended_jobs ?? [])
							: "jobs" in (fallbackData ?? {})
								? ((fallbackData as { jobs?: JobRecord[] }).jobs ?? [])
								: [];

					if (recommended.length > 0 && isActive) {
						localStorage.setItem(
							CANDIDATE_ID_STORAGE_KEY,
							DEFAULT_RECOMMEND_CANDIDATE_ID,
						);
						setCandidateId(DEFAULT_RECOMMEND_CANDIDATE_ID);
					}
				}

				if (isActive) {
					setRecommendedJobs(recommended);
					void refreshApplicantsCount(recommended);
				}
			} catch {
				if (isActive) {
					setRecommendedJobs([]);
					setApplicantsCountByJobId({});
				}
			} finally {
				if (isActive) {
					setRecommendedLoading(false);
				}
			}
		};

		void loadCandidateData();

		return () => {
			isActive = false;
		};
	}, [candidateId]);

	const statusByJobId = useMemo(() => {
		const map = new Map<string, string>();
		applications.forEach((application) => {
			map.set(application.job_id, application.status);
		});
		return map;
	}, [applications]);

	const applyForJob = async (jobId: string) => {
		if (!candidateId) {
			setErrorMessage("Candidate ID not available in local storage.");
			return;
		}

		setApplyLoadingJobId(jobId);
		setErrorMessage(null);
		setSuccessMessage(null);

		try {
			await applyToJob(jobId, candidateId);
			setSuccessMessage("Application submitted successfully.");

			// Refresh application list so applied status appears immediately.
			await refreshMyApplications(candidateId);
			if (recommendedJobs.length > 0) {
				await refreshApplicantsCount(recommendedJobs);
			}
		} catch {
			setErrorMessage("Could not apply for this job. You may have already applied.");
		} finally {
			setApplyLoadingJobId(null);
		}
	};

	return (
		<div
			className="min-h-screen bg-white text-slate-900"
			style={{ fontFamily: "'DM Sans', sans-serif" }}
		>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
				*, *::before, *::after { box-sizing: border-box; }
			`}</style>

			<header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
				<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
					<div className="flex items-center gap-3">
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
							<svg
								className="h-4 w-4 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<span className="text-sm font-bold tracking-tight text-slate-900">
							Job Portal
						</span>
						<span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
							Candidate
						</span>
					</div>

					<div className="flex items-center gap-3">
						<Link
							to="/"
							className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
						>
							Home
						</Link>
						<Link
							to="/recruiter/jobs"
							className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
						>
							Recruiter View
						</Link>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-6 py-6">
				<div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
					Candidate source: localStorage key <span className="font-semibold">candidate_id</span>
				</div>

				{errorMessage ? (
					<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
						{errorMessage}
					</div>
				) : null}
				{successMessage ? (
					<div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
						{successMessage}
					</div>
				) : null}

				<section className="mb-6">
					<div className="mb-3 flex items-center justify-between">
						<h2 className="text-base font-bold text-slate-900">My Applications</h2>
						<span className="text-xs text-slate-500">{applications.length} total</span>
					</div>

					{appsLoading ? (
						<div className="grid gap-3 md:grid-cols-2">
							{[1, 2].map((item) => (
								<div
									key={item}
									className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
								/>
							))}
						</div>
					) : applications.length === 0 ? (
						<div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
							You have not applied to any job yet.
						</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2">
							{applications.map((application) => (
								<article
									key={application.application_id}
									className="rounded-xl border border-slate-200 bg-white p-4"
								>
									<div className="mb-2 flex items-center justify-between gap-2">
										<p className="text-sm font-semibold text-slate-900">
											{application.job_title && application.job_title !== "Unknown"
												? application.job_title
												: `Job ID: ${application.job_id}`}
										</p>
										<span
											className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusColor(application.status)}`}
										>
											{formatStatusLabel(application.status)}
										</span>
									</div>
									<p className="text-xs text-slate-500">
										Application ID: {application.application_id}
									</p>
									<p className="mt-1 text-xs text-slate-500">
										Job ID: {application.job_id}
									</p>
									{application.applied_at ? (
										<p className="mt-1 text-xs text-slate-500">
											Applied at: {new Date(application.applied_at).toLocaleString()}
										</p>
									) : null}
								</article>
							))}
						</div>
					)}
				</section>

				<section>
					<div className="mb-3 flex items-center justify-between">
						<h2 className="text-base font-bold text-slate-900">Recommended Jobs</h2>
						<span className="text-xs text-slate-500">{recommendedJobs.length} total</span>
					</div>

					{recommendedLoading ? (
						<div className="grid gap-3 md:grid-cols-2">
							{[1, 2, 3, 4].map((item) => (
								<div
									key={item}
									className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
								/>
							))}
						</div>
					) : recommendedJobs.length === 0 ? (
						<div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
							No recommended jobs available for this candidate.
						</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2">
							{recommendedJobs.map((job) => {
								const currentStatus = statusByJobId.get(job.job_id);
								const requiredSkills = (job.required_skills ?? []).map(toSkillLabel);
								const preferredSkills = (job.preferred_skills ?? []).map(toSkillLabel);

								return (
									<article
										key={job.job_id}
										className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
									>
										<div className="mb-2 flex items-start justify-between gap-2">
											<div>
												<h3 className="text-base font-bold text-slate-900">{job.title}</h3>
												<p className="text-xs text-slate-500">
													{job.location ?? "Remote"} · {job.experience_required ?? "Experience not specified"}
												</p>
											</div>
											{currentStatus ? (
												<span
													className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusColor(currentStatus)}`}
												>
													{formatStatusLabel(currentStatus)}
												</span>
											) : null}
										</div>

										<p className="text-sm leading-relaxed text-slate-700">
											{job.description ?? "No description provided."}
										</p>

										{job.reason ? (
											<p className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
												{job.reason}
											</p>
										) : null}

										<div className="mt-3">
											<p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
												Required Skills
											</p>
											<div className="flex flex-wrap gap-1">
												{requiredSkills.length > 0 ? (
													requiredSkills.map((skill) => (
														<span
															key={`${job.job_id}-${skill}`}
															className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
														>
															{skill}
														</span>
													))
												) : (
													<span className="text-xs text-slate-500">No required skills listed</span>
												)}
											</div>
										</div>

										{preferredSkills.length > 0 ? (
											<div className="mt-3">
												<p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
													Preferred Skills
												</p>
												<div className="flex flex-wrap gap-1">
													{preferredSkills.map((skill) => (
														<span
															key={`${job.job_id}-preferred-${skill}`}
															className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
														>
															{skill}
														</span>
													))}
												</div>
											</div>
										) : null}

										<div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
											<span className="text-xs text-slate-500">
												{applicantsCountByJobId[job.job_id] ?? job.applicants?.length ?? 0} applicants
											</span>

											{currentStatus ? (
												<button
													disabled
													className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500"
												>
													Already Applied
												</button>
											) : (
												<button
													disabled={
														!candidateId || applyLoadingJobId === job.job_id || appsLoading
													}
													onClick={() => void applyForJob(job.job_id)}
													className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
												>
													{applyLoadingJobId === job.job_id ? "Applying..." : "Apply"}
												</button>
											)}
										</div>
									</article>
								);
							})}
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
