export type Skill = {
    name: string;
};

export type MatchedProject = {
    project: string;
    matched_skills?: string[];
};

export type CandidateProject = {
    id?: string;
    title?: string;
    skills?: string[];
    desc?: string;
    link?: string;
};

export type CandidateEducation = {
    id?: string;
    school?: string;
    institution?: string;
    degree?: string;
    field?: string;
    start_date?: string;
    end_date?: string;
    year?: string;
};

export type CandidateExperience = {
    id?: string;
    company?: string;
    role?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
};

export type Job = {
    job_id?: string;
    id?: string;
    _id?: string;
    title: string;
    location?: string;
    description: string;
    applicants?: string[];
    required_skills?: Array<Skill | string>;
    experience_required?: string;
};

export type RankedCandidate = {
    candidate_id?: string;
    _id?: string;
    application_id?: string | null;
    name?: string;
    email?: string;
    status?: string;
    bonus?: number;
    education_detail?: string;
    matched_skills?: string[];
    missing_skills?: string[];
    final_score?: number;
    skill_score?: number;
    project_score?: number;
    education_score?: number;
    activity_score?: number;
    completeness_score?: number;
    matched_in_projects?: MatchedProject[];
    education?: CandidateEducation[];
    experience?: CandidateExperience[];
    projects?: CandidateProject[];
};

export type NotificationItem = {
    message: string;
    time?: string;
    created_at?: string;
    read?: boolean;
};

export type JobsResponse = Job[] | { jobs?: Job[] };
export type RankedCandidatesResponse = RankedCandidate[] | { candidates?: RankedCandidate[]; rankings?: RankedCandidate[] };
export type NotificationsResponse = { notifications?: NotificationItem[]; unread?: number };

export type TagVariant = "required" | "matched" | "missing";

export type ScoreBarProps = {
    label: string;
    value?: number;
    color: string;
};

export type TagProps = {
    name: string;
    variant: TagVariant;
};

export type CandidateCardProps = {
    candidate: RankedCandidate;
    rank: number;
    onViewProfile: () => void;
};

export type JobCardProps = {
    job: Job;
    selected: boolean;
    onClick: () => void;
};

export type NotificationBellProps = {
    notifications: NotificationItem[];
    unread: number;
    onOpen: () => void;
};