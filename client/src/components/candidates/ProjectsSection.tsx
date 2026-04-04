import type { Dispatch, SetStateAction } from "react";
import type { Project, ProjectForm } from "./types";
import { getItemId, toSkillsText } from "./utils";

type ProjectsSectionProps = {
  projects: Project[];
  editingProjects: Record<string, ProjectForm>;
  setEditingProjects: Dispatch<SetStateAction<Record<string, ProjectForm>>>;
  newProject: ProjectForm;
  setNewProject: Dispatch<SetStateAction<ProjectForm>>;
  onAdd: () => void;
  onUpdate: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  saving: string | null;
};

const ProjectsSection = ({
  projects,
  editingProjects,
  setEditingProjects,
  newProject,
  setNewProject,
  onAdd,
  onUpdate,
  onDelete,
  saving,
}: ProjectsSectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Projects</h3>
        <span className="text-xs text-slate-400">{projects.length} total</span>
      </div>
      <div className="mt-4 space-y-4">
        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">
            Add your first project below.
          </p>
        ) : null}
        {projects.map((project) => {
          const projectId = getItemId(project);
          const editing = editingProjects[projectId];

          return (
            <div
              key={projectId}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              {editing ? (
                <div className="space-y-3">
                  <input
                    value={editing.title}
                    onChange={(event) =>
                      setEditingProjects((current) => ({
                        ...current,
                        [projectId]: {
                          ...current[projectId],
                          title: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Project title"
                  />
                  <textarea
                    value={editing.desc}
                    onChange={(event) =>
                      setEditingProjects((current) => ({
                        ...current,
                        [projectId]: {
                          ...current[projectId],
                          desc: event.target.value,
                        },
                      }))
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Project description"
                  />
                  <input
                    value={editing.link}
                    onChange={(event) =>
                      setEditingProjects((current) => ({
                        ...current,
                        [projectId]: {
                          ...current[projectId],
                          link: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Project link"
                  />
                  <input
                    value={editing.skillsText}
                    onChange={(event) =>
                      setEditingProjects((current) => ({
                        ...current,
                        [projectId]: {
                          ...current[projectId],
                          skillsText: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Skills (comma separated)"
                  />
                  <input
                    value={editing.mediaText}
                    onChange={(event) =>
                      setEditingProjects((current) => ({
                        ...current,
                        [projectId]: {
                          ...current[projectId],
                          mediaText: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    placeholder="Media links (comma separated)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdate(projectId)}
                      disabled={saving === `project-update-${projectId}`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {saving === `project-update-${projectId}`
                        ? "Saving..."
                        : "Save"}
                    </button>
                    <button
                      onClick={() =>
                        setEditingProjects((current) => {
                          const next = { ...current };
                          delete next[projectId];
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
                    {project.title ?? "Untitled Project"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {project.desc ?? "No description added."}
                  </p>
                  <p className="mt-2 text-xs text-indigo-600">
                    {(project.skills ?? []).join(", ") || "No skills"}
                  </p>
                  {project.link ? (
                    <p className="mt-2 text-xs text-slate-500">
                      {project.link}
                    </p>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() =>
                        setEditingProjects((current) => ({
                          ...current,
                          [projectId]: {
                            title: project.title ?? "",
                            desc: project.desc ?? "",
                            link: project.link ?? "",
                            skillsText: toSkillsText(project.skills),
                            mediaText: toSkillsText(project.media_link),
                          },
                        }))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(projectId)}
                      disabled={saving === `project-delete-${projectId}`}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                    >
                      {saving === `project-delete-${projectId}`
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
        <h4 className="text-sm font-semibold text-slate-900">Add Project</h4>
        <div className="mt-3 space-y-3">
          <input
            value={newProject.title}
            onChange={(event) =>
              setNewProject((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Project title"
          />
          <textarea
            value={newProject.desc}
            onChange={(event) =>
              setNewProject((current) => ({
                ...current,
                desc: event.target.value,
              }))
            }
            rows={3}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Project description"
          />
          <input
            value={newProject.link}
            onChange={(event) =>
              setNewProject((current) => ({
                ...current,
                link: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Project link"
          />
          <input
            value={newProject.skillsText}
            onChange={(event) =>
              setNewProject((current) => ({
                ...current,
                skillsText: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Skills (comma separated)"
          />
          <input
            value={newProject.mediaText}
            onChange={(event) =>
              setNewProject((current) => ({
                ...current,
                mediaText: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Media links (comma separated)"
          />
          <button
            onClick={onAdd}
            disabled={saving === "project-add"}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving === "project-add" ? "Adding..." : "Add Project"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
