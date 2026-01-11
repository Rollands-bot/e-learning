import { pgTable, uuid, text, timestamp, integer, pgEnum, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'TEACHER', 'STUDENT']);
export const activityTypeEnum = pgEnum('activity_type', ['FILE', 'ASSIGNMENT', 'FORUM', 'LINK']);
export const submissionStatusEnum = pgEnum('submission_status', ['PENDING', 'GRADED']);

// 1. Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(), // NPM / NIP
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').default('STUDENT').notNull(),
  password: text('password').notNull(), 
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  submissions: many(submissions),
}));

// 2. Courses Table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  category: text('category'),
  instructorId: uuid('instructor_id').references(() => users.id),
  thumbnail: text('thumbnail'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  sections: many(sections),
}));

// 3. Sections Table
export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
});

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  activities: many(activities),
}));

// 4. Activities Table
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  sectionId: uuid('section_id').references(() => sections.id).notNull(),
  type: activityTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  contentUrl: text('content_url'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  section: one(sections, {
    fields: [activities.sectionId],
    references: [sections.id],
  }),
  submissions: many(submissions),
}));

// 5. Submissions & Grades Table
export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').references(() => activities.id).notNull(),
  studentId: uuid('student_id').references(() => users.id).notNull(),
  status: submissionStatusEnum('status').default('PENDING').notNull(),
  grade: integer('grade'),
  feedback: text('feedback'),
  fileUrl: text('file_url'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

export const submissionsRelations = relations(submissions, ({ one }) => ({
  activity: one(activities, {
    fields: [submissions.activityId],
    references: [activities.id],
  }),
  student: one(users, {
    fields: [submissions.studentId],
    references: [users.id],
  }),
}));
