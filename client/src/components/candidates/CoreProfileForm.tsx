import type { Dispatch, SetStateAction } from "react";
import type { ProfileForm } from "./types";

type CoreProfileFormProps = {
  candidateId: string;
  profileForm: ProfileForm;
  setProfileForm: Dispatch<SetStateAction<ProfileForm>>;
  onSave: () => void;
  saving: string | null;
  loading: boolean;
};

const CoreProfileForm = ({
  candidateId,
  profileForm,
  setProfileForm,
  onSave,
  saving,
  loading,
}: CoreProfileFormProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Core Profile</h2>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
          Candidate ID {candidateId}
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          First Name
          <input
            value={profileForm.first_name}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                first_name: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Last Name
          <input
            value={profileForm.last_name}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                last_name: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Email
          <input
            type="email"
            value={profileForm.email}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Phone
          <input
            value={profileForm.phone_number}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                phone_number: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2">
          Bio
          <textarea
            value={profileForm.bio}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                bio: event.target.value,
              }))
            }
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2">
          Skills (comma separated)
          <input
            value={profileForm.skillsText}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                skillsText: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2">
          Resume Link
          <input
            value={profileForm.resume}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                resume: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          GitHub
          <input
            value={profileForm.github_link}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                github_link: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          LeetCode
          <input
            value={profileForm.leetcode_link}
            onChange={(event) =>
              setProfileForm((current) => ({
                ...current,
                leetcode_link: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
          />
        </label>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving === "profile"}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving === "profile" ? "Saving..." : "Save Profile"}
        </button>
        {loading ? (
          <span className="text-xs text-slate-400">Loading profile...</span>
        ) : null}
      </div>
    </section>
  );
};

export default CoreProfileForm;
