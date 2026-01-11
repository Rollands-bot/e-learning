'use server';

import { db } from '@/lib/db';
import { courses, sections, activities, users, submissions } from '@/lib/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCoursesAction() {
  try {
    const allCourses = await db.query.courses.findMany({
      with: {
        instructor: true,
        sections: {
          with: {
            activities: true
          }
        }
      }
    });
    return allCourses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export async function createCourseAction(data: any) {
  try {
    await db.insert(courses).values({
      code: data.code,
      title: data.title,
      category: data.category,
      instructorId: data.instructorId,
      thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80',
    });
    revalidatePath('/admin/courses');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error creating course:', error);
    return { success: false, message: 'Gagal membuat mata kuliah.' };
  }
}

export async function deleteCourseAction(courseId: string) {
  try {
    // Delete related submissions first if needed, or rely on cascade
    await db.delete(courses).where(eq(courses.id, courseId));
    revalidatePath('/admin/courses');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting course:', error);
    return { success: false, message: 'Gagal menghapus mata kuliah.' };
  }
}

export async function getCourseDetailAction(courseId: string) {
  try {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        instructor: true,
        sections: {
          orderBy: [asc(sections.order)],
          with: {
            activities: {
              orderBy: [asc(activities.createdAt)]
            }
          }
        }
      }
    });
    return course;
  } catch (error) {
    console.error('Error fetching course detail:', error);
    return null;
  }
}

export async function createSectionAction(courseId: string, title: string) {
  try {
    await db.insert(sections).values({
      courseId,
      title,
      order: 0,
    });
    revalidatePath(`/course/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating section:', error);
    return { success: false };
  }
}

export async function deleteSectionAction(courseId: string, sectionId: string) {
  try {
    await db.delete(sections).where(eq(sections.id, sectionId));
    revalidatePath(`/course/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting section:', error);
    return { success: false };
  }
}

export async function createActivityAction(courseId: string, data: any) {
  try {
    await db.insert(activities).values({
      sectionId: data.sectionId,
      type: data.type,
      title: data.title,
      description: data.description,
      contentUrl: data.contentUrl,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    });
    revalidatePath(`/course/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating activity:', error);
    return { success: false };
  }
}

export async function getRecentActivitiesAction() {
  try {
    const recentSubmissions = await db.query.submissions.findMany({
      limit: 5,
      orderBy: [desc(submissions.submittedAt)],
      with: {
        student: true,
        activity: {
          with: {
            section: {
              with: {
                course: true
              }
            }
          }
        }
      }
    });
    return recentSubmissions;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

export async function getActivityDetailAction(activityId: string) {
  try {
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, activityId),
      with: {
        section: {
          with: {
            course: true
          }
        }
      }
    });
    return activity;
  } catch (error) {
    console.error('Error fetching activity detail:', error);
    return null;
  }
}
