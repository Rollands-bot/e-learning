export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  username: string; // NPM atau NIP
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type ActivityType = 'FILE' | 'ASSIGNMENT' | 'FORUM' | 'LINK';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  contentUrl?: string; // Untuk PDF/Link
  dueDate?: string;    // Khusus Assignment
  submissionsCount?: number; // Khusus Dosen
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  activities: Activity[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  instructor: string;
  thumbnail: string;
  sections: Section[];
}

export interface Submission {
  id: string;
  activityId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: 'PENDING' | 'GRADED';
  grade?: number;
  feedback?: string;
  fileUrl?: string;
}
