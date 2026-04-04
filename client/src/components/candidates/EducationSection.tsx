import type { Dispatch, SetStateAction } from "react";
import type { Education, EducationForm } from "./types";
import { getItemId } from "./utils";

type EducationSectionProps = {
  education: Education[];
  editingEducation: Record<string, EducationForm>;
  setEditingEducation: Dispatch<SetStateAction<Record<string, EducationForm>>>;
  newEducation: EducationForm;
  setNewEducation: Dispatch<SetStateAction<EducationForm>>;
  onAdd: () => void;
  onUpdate: (educationId: string) => void;
  onDelete: (educationId: string) => void;
  saving: string | null;
};

const EducationSection = ({
  education,
  editingEducation,
  setEditingEducation,
  newEducation,
  setNewEducation,
  onAdd,
  onUpdate,
  onDelete,
  saving,
}: EducationSectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Education</h3>
        <span className="text-xs text-slate-400">{education.length} total</span>
      </div>
      <div className="mt-4 space-y-4">
        {education.length === 0 ? (
          <p className="text-sm text-slate-500">Add education highlights.</p>
        ) : null}
        {education.map((entry) => {
          const educationId = getItemId(entry);
          const editing = editingEducation[educationId];

          return (
            <div
              key={educationId}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              {editing ? (
                <div className="space-y-3">
                  <input
                    value={editing.institution}
                    onChange={(event) =>
                      setEditingEducation((current) => ({
                        ...current,
                        [educationId]: {
                          ...current[educationId],
                          institution: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Institution"
                  />
                  <input
                    value={editing.degree}
                    onChange={(event) =>
                      setEditingEducation((current) => ({
                        ...current,
                        [educationId]: {
                          ...current[educationId],
                          degree: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Degree"
                  />
                  <input
                    value={editing.field_of_study}
                    onChange={(event) =>
                      setEditingEducation((current) => ({
                        ...current,
                        [educationId]: {
                          ...current[educationId],
                          field_of_study: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Field of study"
                  />
                  <input
                    value={editing.cgpa}
                    onChange={(event) =>
                      setEditingEducation((current) => ({
                        ...current,
                        [educationId]: {
                          ...current[educationId],
                          cgpa: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="CGPA"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="date"
                      value={editing.start_date}
                      onChange={(event) =>
                        setEditingEducation((current) => ({
                          ...current,
                          [educationId]: {
                            ...current[educationId],
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
                        setEditingEducation((current) => ({
                          ...current,
                          [educationId]: {
                            ...current[educationId],
                            end_date: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdate(educationId)}
                      disabled={saving === `education-update-${educationId}`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {saving === `education-update-${educationId}`
                        ? "Saving..."
                        : "Save"}
                    </button>
                    <button
                      onClick={() =>
                        setEditingEducation((current) => {
                          const next = { ...current };
                          delete next[educationId];
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
                    {entry.institution ?? "Unknown Institution"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {entry.degree ?? "Degree"} · {entry.field_of_study ?? "Field"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    CGPA: {entry.cgpa ?? "-"}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {entry.start_date ?? "Start"} -{" "}
                    {entry.end_date ?? "Present"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        setEditingEducation((current) => ({
                          ...current,
                          [educationId]: {
                            institution: entry.institution ?? "",
                            degree: entry.degree ?? "",
                            field_of_study: entry.field_of_study ?? "",
                            cgpa:
                              entry.cgpa !== undefined && entry.cgpa !== null
                                ? String(entry.cgpa)
                                : "",
                            start_date: entry.start_date ?? "",
                            end_date: entry.end_date ?? "",
                          },
                        }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(educationId)}
                      disabled={saving === `education-delete-${educationId}`}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                    >
                      {saving === `education-delete-${educationId}`
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
        <h4 className="text-sm font-semibold text-slate-900">Add Education</h4>
        <div className="mt-3 space-y-3">
          <input
            value={newEducation.institution}
            onChange={(event) =>
              setNewEducation((current) => ({
                ...current,
                institution: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Institution"
          />
          <input
            value={newEducation.degree}
            onChange={(event) =>
              setNewEducation((current) => ({
                ...current,
                degree: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Degree"
          />
          <input
            value={newEducation.field_of_study}
            onChange={(event) =>
              setNewEducation((current) => ({
                ...current,
                field_of_study: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Field of study"
          />
          <input
            value={newEducation.cgpa}
            onChange={(event) =>
              setNewEducation((current) => ({
                ...current,
                cgpa: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="CGPA"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={newEducation.start_date}
              onChange={(event) =>
                setNewEducation((current) => ({
                  ...current,
                  start_date: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={newEducation.end_date}
              onChange={(event) =>
                setNewEducation((current) => ({
                  ...current,
                  end_date: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={onAdd}
            disabled={saving === "education-add"}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving === "education-add" ? "Adding..." : "Add Education"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
