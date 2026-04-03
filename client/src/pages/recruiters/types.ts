export type Skill = {
    name: string;
};

export type MatchedProject = {
    project: string;
    matched_skills?: string[];
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
    name?: string;
    email?: string;
    bonus?: number;
    matched_skills?: string[];
    missing_skills?: string[];
    final_score?: number;
    skill_score?: number;
    project_score?: number;
    education_score?: number;
    activity_score?: number;
    completeness_score?: number;
    matched_in_projects?: MatchedProject[];
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