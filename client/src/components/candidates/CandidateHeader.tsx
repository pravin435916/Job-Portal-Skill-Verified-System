type CandidateHeaderProps = {
  initials: string;
  firstName: string;
  lastName: string;
  email: string;
};

const CandidateHeader = ({
  initials,
  firstName,
  lastName,
  email,
}: CandidateHeaderProps) => {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Candidate Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Profile Studio
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Manage your projects, education, and experience in one place.
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {(firstName || "Candidate") + " " + lastName}
          </p>
          <p className="text-xs text-slate-500">{email}</p>
        </div>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
          Candidate
        </span>
      </div>
    </header>
  );
};

export default CandidateHeader;
