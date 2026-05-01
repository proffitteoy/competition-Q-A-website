export type CompetitionStatus =
  | "draft"
  | "registration_open"
  | "upcoming"
  | "in_progress"
  | "finished"
  | "archived";

export type RegistrationMode = "individual" | "team";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "withdrawn"
  | "cancelled";

export type UserRole =
  | "super_admin"
  | "competition_admin"
  | "content_editor"
  | "student_user";

export interface Competition {
  id: string;
  title: string;
  category: string;
  status: CompetitionStatus;
  summary: string;
  department: string;
  registrationMode: RegistrationMode;
  registrationWindow: string;
  eventWindow: string;
  location: string;
  coverLabel: string;
  description: string;
  highlights: string[];
  timeline: Array<{
    label: string;
    date: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  attachments: string[];
  relatedQuestions: string[];
}

export interface ApplicationRecord {
  id: string;
  competitionId: string;
  competitionTitle: string;
  applicantName: string;
  college: string;
  major: string;
  grade: string;
  submittedAt: string;
  mode: RegistrationMode;
  status: ApplicationStatus;
  reviewer: string;
  note: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  role: UserRole;
  college: string;
  email: string;
  status: "active" | "pending_verification" | "disabled";
}

export interface NoticeRecord {
  id: string;
  title: string;
  competition: string;
  status: "published" | "draft" | "withdrawn";
  updatedAt: string;
}
