
import { useEffect, useMemo, useState } from "react";
import {
  addEducation,
  addExperience,
  addProject,
  deleteEducation,
  deleteExperience,
  deleteProject,
  getCandidateProfile,
  updateCandidate,
  updateEducation,
  updateExperience,
  updateProject,
} from "../../api/candidates/api";
import CandidateHeader from "../../components/candidates/CandidateHeader";
import CoreProfileForm from "../../components/candidates/CoreProfileForm";
import EducationSection from "../../components/candidates/EducationSection";
import ExperienceSection from "../../components/candidates/ExperienceSection";
import ProjectsSection from "../../components/candidates/ProjectsSection";
import type {
  CandidateProfileData,
  EducationForm,
  ExperienceForm,
  ProfileForm,
  ProjectForm,
} from "../../components/candidates/types";
import { toSkillsText } from "../../components/candidates/utils";

const CANDIDATE_ID_STORAGE_KEY = "candidate_id";
const DEFAULT_CANDIDATE_ID = "69cf903ef82584c496f3a08c";
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const toList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const emptyProjectForm = (): ProjectForm => ({
  title: "",
  desc: "",
  link: "",
  skillsText: "",
  mediaText: "",
});

const emptyEducationForm = (): EducationForm => ({
  institution: "",
  degree: "",
  field_of_study: "",
  cgpa: "",
  start_date: "",
  end_date: "",
});

const emptyExperienceForm = (): ExperienceForm => ({
  company: "",
  position: "",
  start_date: "",
  end_date: "",
  description: "",
});
const CandidateProfile = () => {
  const [candidateId, setCandidateId] = useState<string>("");
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
    resume: "",
    phone_number: "",
    skillsText: "",
    github_link: "",
    leetcode_link: "",
  });

  const [newProject, setNewProject] = useState<ProjectForm>(
    emptyProjectForm(),
  );
  const [newEducation, setNewEducation] = useState<EducationForm>(
    emptyEducationForm(),
  );
  const [newExperience, setNewExperience] = useState<ExperienceForm>(
    emptyExperienceForm(),
  );

  const [editingProjects, setEditingProjects] = useState<
    Record<string, ProjectForm>
  >({});
  const [editingEducation, setEditingEducation] = useState<
    Record<string, EducationForm>
  >({});
  const [editingExperience, setEditingExperience] = useState<
    Record<string, ExperienceForm>
  >({});

  const initials = useMemo(() => {
    const name = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`
      .trim()
      .split(" ")
      .filter(Boolean);
    return name.length
      ? `${name[0][0] ?? ""}${name[1]?.[0] ?? ""}`.toUpperCase()
      : "CP";
  }, [profile?.first_name, profile?.last_name]);

  const refreshProfile = async () => {
    if (!candidateId) {
      return;
    }

    setError(null);
    try {
      const response = await getCandidateProfile(candidateId);
      setProfile(response.data as CandidateProfileData);
    } catch {
      setError("Failed to load candidate profile. Is the server running?");
    }
  };

  useEffect(() => {
    const cachedCandidateId =
      (localStorage.getItem(CANDIDATE_ID_STORAGE_KEY) ?? "").trim();
    if (OBJECT_ID_REGEX.test(cachedCandidateId)) {
      setCandidateId(cachedCandidateId);
      return;
    }

    localStorage.setItem(CANDIDATE_ID_STORAGE_KEY, DEFAULT_CANDIDATE_ID);
    setCandidateId(DEFAULT_CANDIDATE_ID);
  }, []);

  useEffect(() => {
    if (!candidateId) {
      return;
    }

    const load = async () => {
      setLoading(true);
      await refreshProfile();
      setLoading(false);
    };

    void load();
  }, [candidateId]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setProfileForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      email: profile.email ?? "",
      bio: profile.bio ?? "",
      resume: profile.resume ?? "",
      phone_number: profile.phone_number ?? "",
      skillsText: toSkillsText(profile.skills),
      github_link: profile.github_link ?? "",
      leetcode_link: profile.leetcode_link ?? "",
    });
  }, [profile]);

  const handleProfileSave = async () => {
    setSaving("profile");
    try {
      await updateCandidate(candidateId, {
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        email: profileForm.email.trim(),
        bio: profileForm.bio.trim(),
        resume: profileForm.resume.trim(),
        phone_number: profileForm.phone_number.trim(),
        skills: toList(profileForm.skillsText),
        github_link: profileForm.github_link.trim(),
        leetcode_link: profileForm.leetcode_link.trim(),
      });
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const handleProjectAdd = async () => {
    setSaving("project-add");
    try {
      await addProject(candidateId, {
        title: newProject.title.trim(),
        desc: newProject.desc.trim(),
        link: newProject.link.trim(),
        skills: toList(newProject.skillsText),
        media_link: toList(newProject.mediaText),
      });
      setNewProject(emptyProjectForm());
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const handleProjectUpdate = async (projectId: string) => {
    const payload = editingProjects[projectId];
    if (!payload) {
      return;
    }

    setSaving(`project-update-${projectId}`);
    try {
      await updateProject(projectId, {
        title: payload.title.trim(),
        desc: payload.desc.trim(),
        link: payload.link.trim(),
        skills: toList(payload.skillsText),
        media_link: toList(payload.mediaText),
      });
      setEditingProjects((current) => {
        const next = { ...current };
        delete next[projectId];
        return next;
      });
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    setSaving(`project-delete-${projectId}`);
    try {
      await deleteProject(projectId);
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const handleEducationAdd = async () => {
    setSaving("education-add");
    try {
      await addEducation(candidateId, {
        institution: newEducation.institution.trim(),
        degree: newEducation.degree.trim(),
        field_of_study: newEducation.field_of_study.trim(),
        cgpa: newEducation.cgpa ? Number(newEducation.cgpa) : 0,
        start_date: newEducation.start_date,
        end_date: newEducation.end_date || null,
      });
      setNewEducation(emptyEducationForm());
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const handleEducationUpdate = async (educationId: string) => {
    const payload = editingEducation[educationId];
    if (!payload) {
      return;
    }

    setSaving(`education-update-${educationId}`);
    try {
      await updateEducation(educationId, {
        institution: payload.institution.trim(),
        degree: payload.degree.trim(),
        field_of_study: payload.field_of_study.trim(),
        cgpa: payload.cgpa ? Number(payload.cgpa) : 0,
        start_date: payload.start_date,
        end_date: payload.end_date || null,
      });
      setEditingEducation((current) => {
        const next = { ...current };
        delete next[educationId];
        return next;
      });
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const handleEducationDelete = async (educationId: string) => {
    setSaving(`education-delete-${educationId}`);
    try {
      await deleteEducation(educationId);
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const handleExperienceAdd = async () => {
    setSaving("experience-add");
    try {
      await addExperience(candidateId, {
        company: newExperience.company.trim(),
        position: newExperience.position.trim(),
        start_date: newExperience.start_date,
        end_date: newExperience.end_date || null,
        description: newExperience.description.trim(),
      });
      setNewExperience(emptyExperienceForm());
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const handleExperienceUpdate = async (experienceId: string) => {
    const payload = editingExperience[experienceId];
    if (!payload) {
      return;
    }

    setSaving(`experience-update-${experienceId}`);
    try {
      await updateExperience(experienceId, {
        company: payload.company.trim(),
        position: payload.position.trim(),
        start_date: payload.start_date,
        end_date: payload.end_date || null,
        description: payload.description.trim(),
      });
      setEditingExperience((current) => {
        const next = { ...current };
        delete next[experienceId];
        return next;
      });
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const handleExperienceDelete = async (experienceId: string) => {
    setSaving(`experience-delete-${experienceId}`);
    try {
      await deleteExperience(experienceId);
      await refreshProfile();
    } finally {
      setSaving(null);
    }
  };

  const projects = profile?.projects ?? [];
  const education = profile?.education ?? [];
  const experience = profile?.experience ?? [];
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
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-12 pt-8">
        <CandidateHeader
          initials={initials}
          firstName={profileForm.first_name}
          lastName={profileForm.last_name}
          email={profileForm.email}
        />

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6">
          <CoreProfileForm
            candidateId={candidateId}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            onSave={handleProfileSave}
            saving={saving}
            loading={loading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ProjectsSection
            projects={projects}
            editingProjects={editingProjects}
            setEditingProjects={setEditingProjects}
            newProject={newProject}
            setNewProject={setNewProject}
            onAdd={handleProjectAdd}
            onUpdate={handleProjectUpdate}
            onDelete={handleProjectDelete}
            saving={saving}
          />
          <EducationSection
            education={education}
            editingEducation={editingEducation}
            setEditingEducation={setEditingEducation}
            newEducation={newEducation}
            setNewEducation={setNewEducation}
            onAdd={handleEducationAdd}
            onUpdate={handleEducationUpdate}
            onDelete={handleEducationDelete}
            saving={saving}
          />
          <ExperienceSection
            experience={experience}
            editingExperience={editingExperience}
            setEditingExperience={setEditingExperience}
            newExperience={newExperience}
            setNewExperience={setNewExperience}
            onAdd={handleExperienceAdd}
            onUpdate={handleExperienceUpdate}
            onDelete={handleExperienceDelete}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
