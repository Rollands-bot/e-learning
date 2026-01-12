// src/lib/db/type-mapping.ts
// File ini menyediakan mapping antara tipe dari Drizzle schema dan Supabase schema
// Karena Supabase menggunakan PostgreSQL di belakang layar, struktur data seharusnya sama
// Namun kolom-kolom mungkin memiliki casing yang berbeda (snake_case vs camelCase)

import { User, Course, Section, Activity, Submission, ActivityType } from '@/types';

// Mapping dari Supabase (snake_case) ke tipe aplikasi (camelCase)
export const mapSupabaseUserToApp = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    username: supabaseUser.username,
    name: supabaseUser.name,
    email: supabaseUser.email,
    role: supabaseUser.role,
    avatar: supabaseUser.avatar || undefined,
  };
};

export const mapAppUserToSupabase = (appUser: User): any => {
  return {
    id: appUser.id,
    username: appUser.username,
    name: appUser.name,
    email: appUser.email,
    role: appUser.role,
    avatar: appUser.avatar || null,
  };
};

export const mapSupabaseCourseToApp = (supabaseCourse: any): Course => {
  return {
    id: supabaseCourse.id,
    code: supabaseCourse.code,
    title: supabaseCourse.title,
    category: supabaseCourse.category || '',
    instructor: supabaseCourse.instructor?.name || supabaseCourse.instructor_id || '',
    thumbnail: supabaseCourse.thumbnail || '',
    sections: supabaseCourse.sections?.map(mapSupabaseSectionToApp) || [],
  };
};

export const mapAppCourseToSupabase = (appCourse: Omit<Course, 'sections'>): any => {
  return {
    id: appCourse.id,
    code: appCourse.code,
    title: appCourse.title,
    category: appCourse.category,
    instructor_id: appCourse.instructor, // Perlu mapping ke ID sebenarnya
    thumbnail: appCourse.thumbnail,
  };
};

export const mapSupabaseSectionToApp = (supabaseSection: any): Section => {
  return {
    id: supabaseSection.id,
    title: supabaseSection.title,
    description: supabaseSection.description || undefined,
    activities: supabaseSection.activities?.map(mapSupabaseActivityToApp) || [],
  };
};

export const mapAppSectionToSupabase = (appSection: Section): any => {
  return {
    id: appSection.id,
    title: appSection.title,
    description: appSection.description || null,
    order: appSection.id.length % 100, // Placeholder, sebaiknya dari database
  };
};

export const mapSupabaseActivityToApp = (supabaseActivity: any): Activity => {
  return {
    id: supabaseActivity.id,
    type: supabaseActivity.type as ActivityType,
    title: supabaseActivity.title,
    description: supabaseActivity.description || undefined,
    contentUrl: supabaseActivity.content_url || undefined,
    dueDate: supabaseActivity.due_date || undefined,
  };
};

export const mapAppActivityToSupabase = (appActivity: Activity): any => {
  return {
    id: appActivity.id,
    type: appActivity.type,
    title: appActivity.title,
    description: appActivity.description || null,
    content_url: appActivity.contentUrl || null,
    due_date: appActivity.dueDate || null,
  };
};

export const mapSupabaseSubmissionToApp = (supabaseSubmission: any): Submission => {
  return {
    id: supabaseSubmission.id,
    activityId: supabaseSubmission.activity_id,
    studentId: supabaseSubmission.student_id,
    studentName: supabaseSubmission.student?.name || 'Unknown Student',
    submittedAt: supabaseSubmission.submitted_at,
    status: supabaseSubmission.status as 'PENDING' | 'GRADED',
    grade: supabaseSubmission.grade || undefined,
    feedback: supabaseSubmission.feedback || undefined,
    fileUrl: supabaseSubmission.file_url || undefined,
  };
};

export const mapAppSubmissionToSupabase = (appSubmission: Submission): any => {
  return {
    id: appSubmission.id,
    activity_id: appSubmission.activityId,
    student_id: appSubmission.studentId,
    status: appSubmission.status,
    grade: appSubmission.grade || null,
    feedback: appSubmission.feedback || null,
    file_url: appSubmission.fileUrl || null,
    submitted_at: appSubmission.submittedAt,
  };
};