// src/services/courseService.ts
import { database } from '@/lib/db';
import { Course } from '@/types';

export interface CreateCourseInput {
  code: string;
  title: string;
  category?: string;
  instructor?: string;
  thumbnail?: string;
}

export interface UpdateCourseInput {
  code?: string;
  title?: string;
  category?: string;
  instructor?: string;
  thumbnail?: string;
}

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    try {
      return await database.courses.getAll();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  async getCourseById(id: string): Promise<Course | null> {
    try {
      return await database.courses.getById(id);
    } catch (error) {
      console.error(`Error fetching course with id ${id}:`, error);
      throw error;
    }
  },

  async getCourseByCode(code: string): Promise<Course | null> {
    try {
      return await database.courses.getByCode(code);
    } catch (error) {
      console.error(`Error fetching course with code ${code}:`, error);
      throw error;
    }
  },

  async createCourse(courseData: CreateCourseInput): Promise<Course> {
    try {
      // Hapus property yang tidak diperlukan untuk operasi create
      const { sections, ...courseWithoutSections } = courseData as any;
      return await database.courses.create(courseWithoutSections);
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  async updateCourse(id: string, courseData: UpdateCourseInput): Promise<Course> {
    try {
      return await database.courses.update(id, courseData);
    } catch (error) {
      console.error(`Error updating course with id ${id}:`, error);
      throw error;
    }
  },

  async deleteCourse(id: string): Promise<void> {
    try {
      await database.courses.delete(id);
    } catch (error) {
      console.error(`Error deleting course with id ${id}:`, error);
      throw error;
    }
  }
};