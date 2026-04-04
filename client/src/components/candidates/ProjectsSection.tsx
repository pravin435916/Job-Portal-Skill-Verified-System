import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Project, ProjectForm } from "./types";
import { getItemId, toSkillsText } from "./utils";

type ProjectsSectionProps = {
  projects: Project[];
  editingProjects: Record<string, ProjectForm>;
  setEditingProjects: Dispatch<SetStateAction<Record<string, ProjectForm>>>;
  newProject: ProjectForm;
  setNewProject: Dispatch<SetStateAction<ProjectForm>>;
  newProjectFiles: File[];
  setNewProjectFiles: Dispatch<SetStateAction<File[]>>;
  editProjectFiles: Record<string, File[]>;
  setEditProjectFiles: Dispatch<SetStateAction<Record<string, File[]>>>;
  onAdd: () => void;
  onUpdate: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onSelectMedia: (
    files: FileList | null,
    target: { kind: "new" } | { kind: "edit"; projectId: string },
  ) => void;
  uploadingMediaId: string | null;
  saving: string | null;
  className?: string;
};

const ProjectsSection = ({
  projects,
  editingProjects,
  setEditingProjects,
  newProject,
  setNewProject,
  newProjectFiles,
  setNewProjectFiles,
  editProjectFiles,
  setEditProjectFiles,
  onAdd,
  onUpdate,
  onDelete,
  onSelectMedia,
  uploadingMediaId,
  saving,
  className,
}: ProjectsSectionProps) => {
  const [carouselIndex, setCarouselIndex] = useState<Record<string, number>>(
    {},
  );

  const getMediaType = (url: string) => {
    const cleanUrl = url.split("?")[0]?.toLowerCase() ?? "";
    if (cleanUrl.match(/\.(mp4|webm|ogg|mov)$/)) {
      return "video";
    }
    return "image";
  };

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className ?? ""}`}
    >
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
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(event) =>
                        onSelectMedia(event.target.files, {
                          kind: "edit",
                          projectId,
                        })
                      }
                      className="text-xs text-slate-500"
                    />
                    {(editing.mediaLinks ?? []).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {editing.mediaLinks.map((link) => (
                          <div
                            key={link}
                            className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                          >
                            <span className="truncate max-w-[140px]">media</span>
                            <button
                              onClick={() =>
                                setEditingProjects((current) => ({
                                  ...current,
                                  [projectId]: {
                                    ...current[projectId],
                                    mediaLinks: current[projectId].mediaLinks.filter(
                                      (item) => item !== link,
                                    ),
                                  },
                                }))
                              }
                              className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-500 group-hover:flex"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {(editProjectFiles[projectId] ?? []).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(editProjectFiles[projectId] ?? []).map((file) => (
                          <div
                            key={`${projectId}-${file.name}-${file.size}`}
                            className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                          >
                            <span className="truncate max-w-[140px]">
                              {file.name}
                            </span>
                            <button
                              onClick={() =>
                                setEditProjectFiles((current) => ({
                                  ...current,
                                  [projectId]: (current[projectId] ?? []).filter(
                                    (item) => item !== file,
                                  ),
                                }))
                              }
                              className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-500 group-hover:flex"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {uploadingMediaId === "uploading" ? (
                      <span className="text-xs text-slate-400">
                        Uploading media on save...
                      </span>
                    ) : null}
                  </div>
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
                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    {(project.media_link ?? []).length > 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-white p-2">
                        {(() => {
                          const media = project.media_link ?? [];
                          const index = Math.min(
                            carouselIndex[projectId] ?? 0,
                            Math.max(media.length - 1, 0),
                          );
                          const current = media[index];
                          const type = getMediaType(current);

                          return (
                            <div className="space-y-2">
                              <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                                {type === "video" ? (
                                  <video
                                    src={current}
                                    controls
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={current}
                                    alt="Project media"
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              {media.length > 1 ? (
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={() =>
                                      setCarouselIndex((state) => ({
                                        ...state,
                                        [projectId]:
                                          (index - 1 + media.length) %
                                          media.length,
                                      }))
                                    }
                                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                                  >
                                    Prev
                                  </button>
                                  <span className="text-xs text-slate-400">
                                    {index + 1} / {media.length}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setCarouselIndex((state) => ({
                                        ...state,
                                        [projectId]: (index + 1) % media.length,
                                      }))
                                    }
                                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                                  >
                                    Next
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-8 text-xs text-slate-400">
                        No media uploaded
                      </div>
                    )}
                  </div>
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
                        onClick={() => {
                          setEditingProjects((current) => ({
                            ...current,
                            [projectId]: {
                              title: project.title ?? "",
                              desc: project.desc ?? "",
                              link: project.link ?? "",
                              skillsText: toSkillsText(project.skills),
                              mediaLinks: project.media_link ?? [],
                            },
                          }));
                          setEditProjectFiles((current) => ({
                            ...current,
                            [projectId]: [],
                          }));
                        }}
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
          <div className="flex flex-col gap-2">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(event) =>
                onSelectMedia(event.target.files, { kind: "new" })
              }
              className="text-xs text-slate-500"
            />
            {newProject.mediaLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {newProject.mediaLinks.map((link) => (
                  <div
                    key={link}
                    className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                  >
                    <span className="truncate max-w-[140px]">media</span>
                    <button
                      onClick={() =>
                        setNewProject((current) => ({
                          ...current,
                          mediaLinks: current.mediaLinks.filter(
                            (item) => item !== link,
                          ),
                        }))
                      }
                      className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-500 group-hover:flex"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {newProjectFiles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {newProjectFiles.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                  >
                    <span className="truncate max-w-[140px]">{file.name}</span>
                    <button
                      onClick={() =>
                        setNewProjectFiles((current) =>
                          current.filter((item) => item !== file),
                        )
                      }
                      className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-500 group-hover:flex"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {uploadingMediaId === "uploading" ? (
              <span className="text-xs text-slate-400">
                Uploading media on save...
              </span>
            ) : null}
          </div>
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
