'use server';

import { db } from '@/lib/db';
import { submissions, activities, sections, courses, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getStudentGradesAction(studentId: string) {
  try {
    const grades = await db.query.submissions.findMany({
      where: eq(submissions.studentId, studentId),
      with: {
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
    return grades;
  } catch (error) {
    console.error('Error fetching student grades:', error);
    return [];
  }
}

export async function getActivitySubmissionsAction(activityId: string) {
  try {
    const data = await db.query.submissions.findMany({
      where: eq(submissions.activityId, activityId),
      with: {
        student: true
      },
      orderBy: (submissions: any, { desc }: any) => [desc(submissions.submittedAt)]
    });
    return data;
  } catch (error) {
    console.error('Error fetching activity submissions:', error);
    return [];
  }
}

export async function updateGradeAction(submissionId: string, data: { grade: number, feedback: string }) {
  try {
    await db.update(submissions).set({
      grade: data.grade,
      feedback: data.feedback,
      status: 'GRADED'
    }).where(eq(submissions.id, submissionId));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating grade:', error);
    return { success: false };
  }
}

export async function submitAssignmentAction(data: { activityId: string, studentId: string, fileUrl?: string }) {
  try {
    const [existing] = await db.select().from(submissions).where(
      and(
        eq(submissions.activityId, data.activityId),
        eq(submissions.studentId, data.studentId)
      )
    );

    if (existing) {
      await db.update(submissions).set({
        submittedAt: new Date(),
        status: 'PENDING',
        grade: null,
      }).where(eq(submissions.id, existing.id));
    } else {
      await db.insert(submissions).values({
        activityId: data.activityId,
        studentId: data.studentId,
        status: 'PENDING',
        fileUrl: data.fileUrl || 'dummy-file.pdf',
      });
    }

    revalidatePath(`/course`);
    return { success: true };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return { success: false };
  }
}