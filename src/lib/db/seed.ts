import { db } from './index';
import * as schema from './schema';
import { MOCK_USERS, MOCK_COURSES } from '../constants/mock-data';

async function main() {
  console.log('⏳ Seeding database...');

  // 1. Clean existing data (Optional, be careful!)
  // await db.delete(schema.submissions);
  // await db.delete(schema.activities);
  // await db.delete(schema.sections);
  // await db.delete(schema.courses);
  // await db.delete(schema.users);

  // 2. Seed Users
  console.log('👤 Seeding users...');
  for (const user of MOCK_USERS) {
    await db.insert(schema.users).values({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      password: 'password123', // Password default untuk semua akun simulasi
    }).onConflictDoNothing();
  }

  // 3. Seed Courses, Sections, and Activities
  console.log('📚 Seeding courses & activities...');
  const allUsers = await db.query.users.findMany();
  const teacher = allUsers.find(u => u.role === 'TEACHER');

  for (const course of MOCK_COURSES) {
    const [insertedCourse] = await db.insert(schema.courses).values({
      code: course.code,
      title: course.title,
      category: course.category,
      thumbnail: course.thumbnail,
      instructorId: teacher?.id,
    }).onConflictDoNothing().returning();

    if (insertedCourse) {
      for (const [sIdx, section] of course.sections.entries()) {
        const [insertedSection] = await db.insert(schema.sections).values({
          courseId: insertedCourse.id,
          title: section.title,
          description: section.description,
          order: sIdx,
        }).returning();

        for (const activity of section.activities) {
          await db.insert(schema.activities).values({
            sectionId: insertedSection.id,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            contentUrl: activity.contentUrl,
            dueDate: activity.dueDate ? new Date(activity.dueDate) : null,
          });
        }
      }
    }
  }

  console.log('✅ Seeding completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed!');
  console.error(err);
  process.exit(1);
});
