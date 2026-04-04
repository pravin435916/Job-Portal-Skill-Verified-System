import { useEffect, useRef, useState } from "react";
import {
  getJobApplications as getJobApplicationsApi,
  getJobs,
  getNotifications as getNotificationsApi,
  getRankedCandidates as getRankedCandidatesApi,
  updateApplicationStatus as updateApplicationStatusApi,
} from "../../api/recruiters/api";
import type {
  ApplicationRecord,
  ApplicationStatusUpdatePayload,
  Job,
  CandidateCardProps,
  Skill,
  JobCardProps,
  NotificationBellProps,
  NotificationItem,
  RankedCandidate,
  ScoreBarProps,
  TagProps,
  TagVariant,
  JobsResponse,
  NotificationsResponse,
  RankedCandidatesResponse,
} from "./types";
const api = {
  getRankedCandidates: async (
    jobId: string,
    minScore: number,
    limit: number,
  ): Promise<RankedCandidatesResponse> => {
    const response = await getRankedCandidatesApi(jobId, minScore, limit);
    return response.data as RankedCandidatesResponse;
  },
  getNotifications: async (): Promise<NotificationsResponse> => {
    try {
      const response = await getNotificationsApi();
      return response.data as NotificationsResponse;
    } catch {
      return { notifications: [], unread: 0 };
    }
  },
  getJobApplications: async (jobId: string): Promise<ApplicationRecord[]> => {
    const response = await getJobApplicationsApi(jobId);
    return response.data as ApplicationRecord[];
  },
  updateApplicationStatus: async (
    applicationId: string,
    payload: ApplicationStatusUpdatePayload,
  ): Promise<ApplicationRecord> => {
    const response = await updateApplicationStatusApi(applicationId, payload);
    return response.data as ApplicationRecord;
  },
};

const getJobId = (job: Job): string | undefined =>
  job.job_id ?? job.id ?? job._id;

const toSkillName = (skill: Skill | string): string => {
  if (typeof skill === "string") {
    return skill;
  }

  return skill.name;
};

function ScoreBar({ label, value, color }: ScoreBarProps) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className="text-xs font-bold text-slate-700">
          {Math.round(value ?? 0)}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(value ?? 0, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Tag({ name, variant }: TagProps) {
  const cls: Record<TagVariant, string> = {
    required: "bg-slate-100 text-slate-700 border-slate-200",
    matched: "bg-emerald-50 text-emerald-700 border-emerald-200",
    missing: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${cls[variant]}`}
    >
      {variant === "matched" ? (
        <span className="text-emerald-600 text-xs">✓</span>
      ) : null}
      {variant === "missing" ? (
        <span className="text-red-600 text-xs">✗</span>
      ) : null}
      {name}
    </span>
  );
}

function CandidateCard({ candidate, rank, onViewProfile }: CandidateCardProps) {
  const [open, setOpen] = useState(false);
  const score = candidate.final_score ?? 0;

  const scoreColor =
    score >= 70
      ? "text-emerald-600"
      : score >= 40
        ? "text-amber-600"
        : "text-red-600";
  const borderColor =
    score >= 70
      ? "border-emerald-200"
      : score >= 40
        ? "border-amber-200"
        : "border-slate-200";

  const initials = (candidate.name ?? "?")
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const statusLabel = candidate.status ?? "applied";

  const statusStyles: Record<string, string> = {
    applied: "border-slate-200 bg-slate-50 text-slate-700",
    shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
    interview_scheduled: "border-indigo-200 bg-indigo-50 text-indigo-700",
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-md ${borderColor}`}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200">
          <span className="text-xs font-bold text-slate-900">#{rank + 1}</span>
        </div>

        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {candidate.name ?? "Anonymous Candidate"}
            </p>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[statusLabel] ?? statusStyles.applied}`}
            >
              {statusLabel.replace(/_/g, " ")}
            </span>
            {candidate.bonus && candidate.bonus > 0 ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                ★ +{candidate.bonus} bonus
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {candidate.email ?? "No email provided"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {(candidate.matched_skills ?? []).map((skill: string) => (
              <Tag key={skill} name={skill} variant="matched" />
            ))}
            {(candidate.missing_skills ?? []).map((skill: string) => (
              <Tag key={skill} name={skill} variant="missing" />
            ))}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className={`text-2xl font-black tabular-nums ${scoreColor}`}>
            {Math.round(score)}
          </div>
          <div className="text-xs text-slate-500">/ 100</div>
        </div>
      </div>

      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between border-t border-slate-200 px-5 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <span>Score breakdown</span>
        <span
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      <div className="border-t border-slate-200 bg-white px-5 py-2.5">
        <button
          onClick={onViewProfile}
          className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
        >
          View profile
          <span aria-hidden>→</span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-slate-50 px-5 pb-5 pt-3">
          <ScoreBar
            label="Skills"
            value={candidate.skill_score}
            color="bg-slate-400"
          />
          <ScoreBar
            label="Projects"
            value={candidate.project_score}
            color="bg-violet-500"
          />
          <ScoreBar
            label="Education"
            value={candidate.education_score}
            color="bg-cyan-500"
          />
          <ScoreBar
            label="Activity"
            value={candidate.activity_score}
            color="bg-emerald-500"
          />
          <ScoreBar
            label="Completeness"
            value={candidate.completeness_score}
            color="bg-amber-500"
          />

          {(candidate.matched_in_projects ?? []).length > 0 ? (
            <div className="mt-3 border-t border-slate-200 pt-3">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-600">
                Matched in projects
              </p>
              {(candidate.matched_in_projects ?? []).map(
                (projectMatch, index: number) => (
                  <div
                    key={`${projectMatch.project}-${index}`}
                    className="mb-1 flex items-center gap-1.5 text-xs text-slate-600"
                  >
                    <span className="text-slate-400">-&gt;</span>
                    <span className="font-medium text-slate-700">
                      {projectMatch.project}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span>
                      {(projectMatch.matched_skills ?? []).join(", ")}
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CandidateProfileDrawer({
  candidate,
  application,
  onAction,
  actionLoading,
  onClose,
}: {
  candidate: RankedCandidate | null;
  application: ApplicationRecord | null;
  onAction: (status: ApplicationStatusUpdatePayload["status"]) => void;
  actionLoading: boolean;
  onClose: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  if (!candidate) {
    return null;
  }

  const fullName = candidate.name ?? "Anonymous Candidate";
  const initials = fullName
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const profileId = candidate.candidate_id ?? candidate._id ?? "-";
  const statusLabel = application?.status ?? candidate.status ?? "applied";
  const hasApplication = Boolean(application?.id);

  return (
    <>
      <button
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/30"
        aria-label="Close candidate profile"
      />
      <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-xl overflow-hidden border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white">
                  {initials}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {fullName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {candidate.email ?? "No email provided"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                {Math.round(candidate.final_score ?? 0)}/100
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700">
                {statusLabel}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                ID: {profileId}
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Recruiter Action
              </h3>
              <div className="relative rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-600">
                  {hasApplication
                    ? "Use one action button to set the candidate status."
                    : "Application record not found for the selected job."}
                </p>
                <button
                  disabled={!hasApplication || actionLoading}
                  onClick={() => setActionMenuOpen((value) => !value)}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Take action
                  <span
                    className={`transition-transform ${actionMenuOpen ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>

                {actionMenuOpen ? (
                  <div className="absolute left-3 top-full z-10 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-black/10">
                    <button
                      onClick={() => {
                        onAction("shortlisted");
                        setActionMenuOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => {
                        onAction("rejected");
                        setActionMenuOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        onAction("interview_scheduled");
                        setActionMenuOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                    >
                      Interview scheduled
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Skills Match
              </h3>
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    Matched
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(candidate.matched_skills ?? []).length > 0 ? (
                      (candidate.matched_skills ?? []).map((skill: string) => (
                        <Tag
                          key={`matched-${skill}`}
                          name={skill}
                          variant="matched"
                        />
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        No matched skills
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    Missing
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(candidate.missing_skills ?? []).length > 0 ? (
                      (candidate.missing_skills ?? []).map((skill: string) => (
                        <Tag
                          key={`missing-${skill}`}
                          name={skill}
                          variant="missing"
                        />
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        No missing skills
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Projects
              </h3>
              {(candidate.projects ?? []).length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No projects shared
                </div>
              ) : (
                <div className="space-y-2">
                  {(candidate.projects ?? []).map((project, index: number) => (
                    <div
                      key={`${project.id ?? project.title ?? "project"}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {project.title ?? "Untitled project"}
                      </p>
                      {project.desc ? (
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          {project.desc}
                        </p>
                      ) : null}
                      {(project.skills ?? []).length > 0 ? (
                        <p className="mt-1 text-xs text-slate-600">
                          Skills: {(project.skills ?? []).join(", ")}
                        </p>
                      ) : null}
                      {project.link ? (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Open project link
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Education
              </h3>
              {candidate.education_detail ? (
                <p className="mb-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  {candidate.education_detail}
                </p>
              ) : null}
              {(candidate.education ?? []).length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No education records
                </div>
              ) : (
                <div className="space-y-2">
                  {(candidate.education ?? []).map((item, index: number) => (
                    <div
                      key={`${item.id ?? item.school ?? item.institution ?? "education"}-${index}`}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {item.degree ?? "Degree not specified"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {item.school ??
                          item.institution ??
                          "Institution not specified"}
                      </p>
                      {item.field ? (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Field: {item.field}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Experience
              </h3>
              {(candidate.experience ?? []).length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No experience records
                </div>
              ) : (
                <div className="space-y-2">
                  {(candidate.experience ?? []).map((item, index: number) => (
                    <div
                      key={`${item.id ?? item.company ?? item.role ?? "experience"}-${index}`}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {item.role ?? "Role not specified"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {item.company ?? "Company not specified"}
                      </p>
                      {item.description ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Application
              </h3>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <p>
                  Application ID:{" "}
                  {application?.id ?? candidate.application_id ?? "N/A"}
                </p>
                <p className="mt-1">Candidate ID: {profileId}</p>
                <p className="mt-1">Current status: {statusLabel}</p>
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Recruiter Action
              </h3>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-600">
                  {hasApplication
                    ? "Use one button to set the candidate status."
                    : "Application record not found for the selected job."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    disabled={!hasApplication || actionLoading}
                    onClick={() => onAction("shortlisted")}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Shortlist
                  </button>
                  <button
                    disabled={!hasApplication || actionLoading}
                    onClick={() => onAction("rejected")}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    disabled={!hasApplication || actionLoading}
                    onClick={() => onAction("interview_scheduled")}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Interview
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}

function JobCard({ job, selected, onClick }: JobCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition-all duration-200 ${
        selected
          ? "border-indigo-300 bg-indigo-50"
          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`truncate text-sm font-semibold ${selected ? "text-indigo-900" : "text-slate-900"}`}
        >
          {job.title}
        </p>
        <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
          {job.applicants?.length ?? 0}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-xs text-slate-600">
          📍 {job.location ?? "Remote"}
        </span>
        {job.experience_required ? (
          <>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-600">
              {job.experience_required}
            </span>
          </>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
        {job.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {(job.required_skills ?? []).slice(0, 4).map((skill) => (
          <Tag
            key={toSkillName(skill)}
            name={toSkillName(skill)}
            variant="required"
          />
        ))}
        {(job.required_skills?.length ?? 0) > 4 ? (
          <span className="text-xs text-slate-500">
            +{(job.required_skills?.length ?? 0) - 4} more
          </span>
        ) : null}
      </div>
    </button>
  );
}

function NotificationBell({
  notifications,
  unread,
  onOpen,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((value) => !value);
          onOpen();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        <svg
          className="h-4 w-4 text-slate-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-black/10">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">
              Notifications
            </span>
            {unread > 0 ? (
              <span className="text-xs text-red-600">{unread} unread</span>
            ) : null}
          </div>
          <div className="max-h-64 divide-y divide-slate-200 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No notifications yet
              </div>
            ) : (
              notifications.map(
                (notification: NotificationItem, index: number) => (
                  <div
                    key={`${notification.message}-${index}`}
                    className={`px-4 py-3 transition-colors hover:bg-slate-50 ${notification.read ? "" : "bg-indigo-50"}`}
                  >
                    <p className="text-xs leading-relaxed text-slate-700">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {notification.time ?? notification.created_at}
                    </p>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [limit, setLimit] = useState<number>(20);
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);
  const [candidatesLoading, setCandidatesLoading] = useState<boolean>(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const [jobSearch, setJobSearch] = useState<string>("");
  const [profileCandidate, setProfileCandidate] =
    useState<RankedCandidate | null>(null);
  const [jobApplications, setJobApplications] = useState<ApplicationRecord[]>(
    [],
  );
  const [applicationsLoading, setApplicationsLoading] =
    useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    let isActive = true;

    const loadJobs = async () => {
      setJobsLoading(true);
      setJobsError(null);

      try {
        const response = await getJobs();
        const data = response.data as JobsResponse;
        const list = Array.isArray(data) ? data : (data.jobs ?? []);

        if (!isActive) {
          return;
        }

        setJobs(list);
        setSelectedJob((currentJob) => currentJob ?? list[0] ?? null);
      } catch {
        if (isActive) {
          setJobsError("Failed to load jobs. Is the server running?");
        }
      } finally {
        if (isActive) {
          setJobsLoading(false);
        }
      }
    };

    void loadJobs();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileCandidate(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!selectedJob) {
      setJobApplications([]);
      return;
    }

    let isActive = true;
    const resolvedJobId = getJobId(selectedJob);

    if (!resolvedJobId) {
      setCandidates([]);
      return;
    }

    const loadCandidates = async () => {
      setCandidatesLoading(true);
      setCandidatesError(null);

      try {
        const response = await api.getRankedCandidates(
          resolvedJobId,
          minScore,
          limit,
        );
        const data = response as RankedCandidatesResponse;
        const list = Array.isArray(data)
          ? data
          : (data.candidates ?? data.rankings ?? []);

        if (isActive) {
          setCandidates(list);
        }
      } catch {
        if (isActive) {
          setCandidatesError("Failed to load candidates.");
        }
      } finally {
        if (isActive) {
          setCandidatesLoading(false);
        }
      }
    };

    void loadCandidates();

    const loadApplications = async () => {
      setApplicationsLoading(true);

      try {
        const response = await api.getJobApplications(resolvedJobId);
        if (isActive) {
          setJobApplications(response);
        }
      } catch {
        if (isActive) {
          setJobApplications([]);
        }
      } finally {
        if (isActive) {
          setApplicationsLoading(false);
        }
      }
    };

    void loadApplications();

    return () => {
      isActive = false;
    };
  }, [selectedJob, minScore, limit]);

  useEffect(() => {
    let isActive = true;

    const pollNotifications = async () => {
      // const data = await api.getNotifications();
      // currenlty empty
      const data = { notifications: [], unread: 0 };
      const list = data.notifications ?? [];

      if (!isActive) {
        return;
      }

      setNotifications(list);
      setUnread(
        data.unread ??
          list.filter((notification: NotificationItem) => !notification.read)
            .length,
      );
    };

    void pollNotifications();
    const timer = window.setInterval(() => {
      void pollNotifications();
    }, 30000);

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(jobSearch.toLowerCase()),
  );

  const avgScore = candidates.length
    ? Math.round(
        candidates.reduce(
          (sum, candidate) => sum + (candidate.final_score ?? 0),
          0,
        ) / candidates.length,
      )
    : 0;
  const topScore = candidates.length
    ? Math.round(
        Math.max(...candidates.map((candidate) => candidate.final_score ?? 0)),
      )
    : 0;
  const selectedApplication = profileCandidate
    ? (jobApplications.find(
        (application) =>
          application.candidate_id ===
          (profileCandidate.candidate_id ?? profileCandidate._id),
      ) ?? null)
    : null;

  const handleUpdateCandidateStatus = async (
    status: ApplicationStatusUpdatePayload["status"],
  ) => {
    if (!selectedApplication) {
      return;
    }

    setActionLoading(true);

    try {
      const updatedApplication = await api.updateApplicationStatus(
        selectedApplication.id,
        { status },
      );

      setJobApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === updatedApplication.id
            ? updatedApplication
            : application,
        ),
      );

      setCandidates((currentCandidates) =>
        currentCandidates.map((candidate) => {
          const candidateId = candidate.candidate_id ?? candidate._id;

          return candidateId === updatedApplication.candidate_id
            ? {
                ...candidate,
                status: updatedApplication.status,
                application_id: updatedApplication.id,
              }
            : candidate;
        }),
      );

      setProfileCandidate((currentCandidate) =>
        currentCandidate
          ? {
              ...currentCandidate,
              status: updatedApplication.status,
              application_id: updatedApplication.id,
            }
          : currentCandidate,
      );
    } finally {
      setActionLoading(false);
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
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      {/* <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
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
              Recruiter
            </span>
          </div>
          <NotificationBell
            notifications={notifications}
            unread={unread}
            onOpen={() => setUnread(0)}
          />
        </div>
      </header> */}

      <div
        className="mx-auto flex max-w-7xl gap-6 px-6 py-6"
        style={{ height: "calc(100vh - 56px)" }}
      >
        <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Your Jobs
            </span>
            <span className="text-xs text-slate-400">{jobs.length} total</span>
          </div>

          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search jobs..."
              value={jobSearch}
              onChange={(event) => setJobSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto">
            {jobsLoading ? (
              [1, 2, 3].map((value) => (
                <div
                  key={value}
                  className="h-32 animate-pulse rounded-xl bg-slate-100"
                />
              ))
            ) : jobsError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {jobsError}
              </div>
            ) : filteredJobs.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                No jobs found
              </p>
            ) : (
              filteredJobs.map((job) => (
                <JobCard
                  key={getJobId(job) ?? job.title}
                  job={job}
                  selected={
                    selectedJob
                      ? getJobId(selectedJob) === getJobId(job)
                      : false
                  }
                  onClick={() => setSelectedJob(job)}
                />
              ))
            )}
          </div>
        </aside>

        <main className="flex flex-1 flex-col gap-4 overflow-hidden">
          {selectedJob ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {selectedJob.title}
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedJob.location ?? "Remote"} ·{" "}
                  {selectedJob.experience_required ??
                    "Experience not specified"}{" "}
                  · {selectedJob.applicants?.length ?? 0} applicants
                </p>
              </div>

              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Min score</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={minScore}
                    onChange={(event) =>
                      setMinScore(Number(event.target.value))
                    }
                    className="w-24 accent-indigo-600"
                  />
                  <span className="w-5 text-right text-xs font-bold tabular-nums text-indigo-600">
                    {minScore}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Show</span>
                  <select
                    value={limit}
                    onChange={(event) => setLimit(Number(event.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                  >
                    {[10, 20, 50, 100].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : null}

          {!candidatesLoading && candidates.length > 0 ? (
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900">
                  {candidates.length}
                </span>{" "}
                candidates
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="text-xs text-slate-600">
                Avg <span className="font-bold text-slate-900">{avgScore}</span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="text-xs text-slate-600">
                Top{" "}
                <span className="font-bold text-emerald-600">{topScore}</span>
              </div>
              {minScore > 0 ? (
                <>
                  <div className="h-3 w-px bg-slate-200" />
                  <span className="text-xs text-amber-600">
                    Filtered ≥ {minScore}
                  </span>
                  <button
                    onClick={() => setMinScore(0)}
                    className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700"
                  >
                    clear
                  </button>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto pr-1">
            {!selectedJob ? (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">
                  Select a job to see ranked candidates
                </p>
              </div>
            ) : candidatesLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((value) => (
                  <div
                    key={value}
                    className="h-24 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : candidatesError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {candidatesError}
              </div>
            ) : candidates.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <p className="text-sm text-slate-500">
                  No candidates match current filters
                </p>
                {minScore > 0 ? (
                  <button
                    onClick={() => setMinScore(0)}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    Clear min score filter
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="fade-up flex flex-col gap-3">
                {candidates.map((candidate, index) => (
                  <CandidateCard
                    key={candidate.candidate_id ?? candidate._id ?? index}
                    candidate={candidate}
                    rank={index}
                    onViewProfile={() => setProfileCandidate(candidate)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CandidateProfileDrawer
        candidate={profileCandidate}
        application={selectedApplication}
        onAction={handleUpdateCandidateStatus}
        actionLoading={actionLoading || applicationsLoading}
        onClose={() => setProfileCandidate(null)}
      />
    </div>
  );
}
