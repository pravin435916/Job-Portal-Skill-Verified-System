import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
	applyToJob,
	getAllJobs,
	getMyApplications,
} from "../../api/candidates/api";

const CANDIDATE_ID_STORAGE_KEY = "candidate_id";
const DEFAULT_CANDIDATE_ID = "69cf903ef82584c496f3a08c";
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

type Skill = string | { name?: string };

type JobRecord = {
	job_id: string;
	title: string;
	description?: string;
	required_skills?: Skill[];
	preferred_skills?: Skill[];
	experience_required?: string;
	applicants?: string[];
};

type MyApplication = {
	application_id: string;
	job_id: string;
	status: string;
};

const toSkillLabel = (skill: Skill): string => {
	if (typeof skill === "string") {
		return skill;
	}

	return skill.name ?? "Skill";
};

const formatStatus = (status: string): string =>
	status.replace(/_/g, " ").replace(/^\w/, (char) => char.toUpperCase());

export default function JobApply() {
	const [candidateId, setCandidateId] = useState<string>("");
	const [jobs, setJobs] = useState<JobRecord[]>([]);
	const [applications, setApplications] = useState<MyApplication[]>([]);
	const [search, setSearch] = useState<string>("");
	const [skillFilter, setSkillFilter] = useState<string>("");
	const [experienceFilter, setExperienceFilter] = useState<string>("all");
	const [loading, setLoading] = useState<boolean>(true);
	const [applyLoadingJobId, setApplyLoadingJobId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const refreshApplications = async (id: string) => {
		const response = await getMyApplications(id);
		setApplications((response.data as MyApplication[]) ?? []);
	};

	useEffect(() => {
		const fromStorage =
			(localStorage.getItem(CANDIDATE_ID_STORAGE_KEY) ?? "").trim();
		if (OBJECT_ID_REGEX.test(fromStorage)) {
			setCandidateId(fromStorage);
			return;
		}

		localStorage.setItem(CANDIDATE_ID_STORAGE_KEY, DEFAULT_CANDIDATE_ID);
		setCandidateId(DEFAULT_CANDIDATE_ID);
	}, []);

	useEffect(() => {
		if (!candidateId) {
			return;
		}

		let isActive = true;

		const loadData = async () => {
			setLoading(true);
			setErrorMessage(null);

			try {
				const [jobsResponse, applicationsResponse] = await Promise.all([
					getAllJobs(),
					getMyApplications(candidateId),
				]);

				if (!isActive) {
					return;
				}

				setJobs((jobsResponse.data as JobRecord[]) ?? []);
				setApplications((applicationsResponse.data as MyApplication[]) ?? []);
			} catch {
				if (isActive) {
					setErrorMessage("Failed to load jobs/applications. Please check server.");
				}
			} finally {
				if (isActive) {
					setLoading(false);
				}
			}
		};

		void loadData();

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

	const filteredJobs = useMemo(() => {
		const searchValue = search.trim().toLowerCase();
		const skillValue = skillFilter.trim().toLowerCase();

		return jobs.filter((job) => {
			const title = (job.title ?? "").toLowerCase();
			const description = (job.description ?? "").toLowerCase();
			const requiredSkillNames = (job.required_skills ?? []).map((skill) =>
				toSkillLabel(skill).toLowerCase(),
			);
			const preferredSkillNames = (job.preferred_skills ?? []).map((skill) =>
				toSkillLabel(skill).toLowerCase(),
			);

			const matchesSearch =
				searchValue.length === 0 ||
				title.includes(searchValue) ||
				description.includes(searchValue);

			const matchesSkill =
				skillValue.length === 0 ||
				requiredSkillNames.some((name) => name.includes(skillValue)) ||
				preferredSkillNames.some((name) => name.includes(skillValue));

			const experience = (job.experience_required ?? "").toLowerCase();
			const matchesExperience =
				experienceFilter === "all" ||
				experience.includes(experienceFilter.toLowerCase());

			return matchesSearch && matchesSkill && matchesExperience;
		});
	}, [jobs, search, skillFilter, experienceFilter]);

	const handleApply = async (jobId: string) => {
		if (!candidateId) {
			setErrorMessage("Candidate ID not found in local storage.");
			return;
		}

		setApplyLoadingJobId(jobId);
		setErrorMessage(null);
		setSuccessMessage(null);

		try {
			await applyToJob(jobId, candidateId);
			setSuccessMessage("Application submitted successfully.");
			await refreshApplications(candidateId);
		} catch {
			setErrorMessage("Could not apply. You may have already applied.");
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
						<span className="text-sm font-bold tracking-tight text-slate-900">
							Job Portal
						</span>
						<span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
							Apply Jobs
						</span>
					</div>
					<div className="flex items-center gap-3">
						<Link
							to="/candidate/jobs"
							className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
						>
							Candidate Dashboard
						</Link>
						<Link
							to="/"
							className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
						>
							Home
						</Link>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-6 py-6">
				<div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
					<input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search by title or description"
						className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
					/>
					<input
						value={skillFilter}
						onChange={(event) => setSkillFilter(event.target.value)}
						placeholder="Filter by skill (React, MongoDB...)"
						className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
					/>
					<select
						value={experienceFilter}
						onChange={(event) => setExperienceFilter(event.target.value)}
						className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
					>
						<option value="all">All Experience</option>
						<option value="fresher">Fresher</option>
						<option value="junior">Junior</option>
						<option value="mid">Mid</option>
						<option value="senior">Senior</option>
					</select>
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

				{loading ? (
					<div className="grid gap-3 md:grid-cols-2">
						{[1, 2, 3, 4].map((item) => (
							<div
								key={item}
								className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
							/>
						))}
					</div>
				) : filteredJobs.length === 0 ? (
					<div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
						No jobs match your search/filters.
					</div>
				) : (
					<div className="grid gap-3 md:grid-cols-2">
						{filteredJobs.map((job) => {
							const currentStatus = statusByJobId.get(job.job_id);
							const requiredSkills = (job.required_skills ?? []).map(toSkillLabel);

							return (
								<article
									key={job.job_id}
									className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
								>
									<div className="mb-2 flex items-start justify-between gap-2">
										<div>
											<h3 className="text-base font-bold text-slate-900">{job.title}</h3>
											<p className="text-xs text-slate-500">
												{job.experience_required ?? "Experience not specified"}
											</p>
										</div>
										{currentStatus ? (
											<span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
												{formatStatus(currentStatus)}
											</span>
										) : null}
									</div>

									<p className="text-sm leading-relaxed text-slate-700">
										{job.description ?? "No description provided."}
									</p>

									<div className="mt-3 flex flex-wrap gap-1">
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
											<span className="text-xs text-slate-500">No skills listed</span>
										)}
									</div>

									<div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
										<span className="text-xs text-slate-500">
											{(job.applicants ?? []).length} applicants
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
												disabled={applyLoadingJobId === job.job_id}
												onClick={() => void handleApply(job.job_id)}
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
			</main>
		</div>
	);
}
