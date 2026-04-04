import type { Dispatch, SetStateAction } from "react";
import type { Experience, ExperienceForm } from "./types";
import { getItemId } from "./utils";

type ExperienceSectionProps = {
  experience: Experience[];
  editingExperience: Record<string, ExperienceForm>;
  setEditingExperience: Dispatch<SetStateAction<Record<string, ExperienceForm>>>;
  newExperience: ExperienceForm;
  setNewExperience: Dispatch<SetStateAction<ExperienceForm>>;
  onAdd: () => void;
  onUpdate: (experienceId: string) => void;
  onDelete: (experienceId: string) => void;
  saving: string | null;
};

const ExperienceSection = ({
  experience,
  editingExperience,
  setEditingExperience,
  newExperience,
  setNewExperience,
  onAdd,
  onUpdate,
  onDelete,
  saving,
}: ExperienceSectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Experience</h3>
        <span className="text-xs text-slate-400">{experience.length} total</span>
      </div>
      <div className="mt-4 space-y-4">
        {experience.length === 0 ? (
          <p className="text-sm text-slate-500">Add your work experience.</p>
        ) : null}
        {experience.map((entry) => {
          const experienceId = getItemId(entry);
          const editing = editingExperience[experienceId];

          return (
            <div
              key={experienceId}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              {editing ? (
                <div className="space-y-3">
                  <input
                    value={editing.company}
                    onChange={(event) =>
                      setEditingExperience((current) => ({
                        ...current,
                        [experienceId]: {
                          ...current[experienceId],
                          company: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Company"
                  />
                  <input
                    value={editing.position}
                    onChange={(event) =>
                      setEditingExperience((current) => ({
                        ...current,
                        [experienceId]: {
                          ...current[experienceId],
                          position: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Position"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="date"
                      value={editing.start_date}
                      onChange={(event) =>
                        setEditingExperience((current) => ({
                          ...current,
                          [experienceId]: {
                            ...current[experienceId],
                            start_date: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={editing.end_date}
                      onChange={(event) =>
                        setEditingExperience((current) => ({
                          ...current,
                          [experienceId]: {
                            ...current[experienceId],
                            end_date: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <textarea
                    value={editing.description}
                    onChange={(event) =>
                      setEditingExperience((current) => ({
                        ...current,
                        [experienceId]: {
                          ...current[experienceId],
                          description: event.target.value,
                        },
                      }))
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdate(experienceId)}
                      disabled={saving === `experience-update-${experienceId}`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {saving === `experience-update-${experienceId}`
                        ? "Saving..."
                        : "Save"}
                    </button>
                    <button
                      onClick={() =>
                        setEditingExperience((current) => {
                          const next = { ...current };
                          delete next[experienceId];
                          return next;
                        })
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {entry.position ?? "Role"} · {entry.company ?? "Company"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.description ?? "No description added."}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {entry.start_date ?? "Start"} -{" "}
                    {entry.end_date ?? "Present"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        setEditingExperience((current) => ({
                          ...current,
                          [experienceId]: {
                            company: entry.company ?? "",
                            position: entry.position ?? "",
                            start_date: entry.start_date ?? "",
                            end_date: entry.end_date ?? "",
                            description: entry.description ?? "",
                          },
                        }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(experienceId)}
                      disabled={saving === `experience-delete-${experienceId}`}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                    >
                      {saving === `experience-delete-${experienceId}`
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <h4 className="text-sm font-semibold text-slate-900">Add Experience</h4>
        <div className="mt-3 space-y-3">
          <input
            value={newExperience.company}
            onChange={(event) =>
              setNewExperience((current) => ({
                ...current,
                company: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Company"
          />
          <input
            value={newExperience.position}
            onChange={(event) =>
              setNewExperience((current) => ({
                ...current,
                position: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Position"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={newExperience.start_date}
              onChange={(event) =>
                setNewExperience((current) => ({
                  ...current,
                  start_date: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={newExperience.end_date}
              onChange={(event) =>
                setNewExperience((current) => ({
                  ...current,
                  end_date: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <textarea
            value={newExperience.description}
            onChange={(event) =>
              setNewExperience((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Description"
          />
          <button
            onClick={onAdd}
            disabled={saving === "experience-add"}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving === "experience-add" ? "Adding..." : "Add Experience"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
