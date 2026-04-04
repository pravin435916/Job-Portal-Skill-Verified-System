export type Project = {
  id?: string;
  _id?: string;
  title?: string;
  desc?: string;
  link?: string;
  skills?: string[];
  media_link?: string[];
};

export type Education = {
  id?: string;
  _id?: string;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  cgpa?: number;
  start_date?: string;
  end_date?: string | null;
};

export type Experience = {
  id?: string;
  _id?: string;
  company?: string;
  position?: string;
  start_date?: string;
  end_date?: string | null;
  description?: string;
};

export type CandidateProfileData = {
  id?: string;
  _id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  resume?: string;
  phone_number?: string;
  skills?: string[];
  github_link?: string;
  leetcode_link?: string;
  projects?: Project[];
  education?: Education[];
  experience?: Experience[];
};

export type ProjectForm = {
  title: string;
  desc: string;
  link: string;
  skillsText: string;
  mediaLinks: string[];
};

export type EducationForm = {
  institution: string;
  degree: string;
  field_of_study: string;
  cgpa: string;
  start_date: string;
  end_date: string;
};

export type ExperienceForm = {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
};

export type ProfileForm = {
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  resume: string;
  phone_number: string;
  skillsText: string;
  github_link: string;
  leetcode_link: string;
};
