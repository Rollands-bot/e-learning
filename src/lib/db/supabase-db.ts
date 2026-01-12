// src/lib/db/supabase-db.ts
// File ini menyediakan antarmuka database menggunakan Supabase
import { supabase } from '../supabase/client';
import { createSupabaseServerClient } from '../supabase/server';
import {
  mapSupabaseUserToApp,
  mapAppUserToSupabase,
  mapSupabaseCourseToApp,
  mapSupabaseSectionToApp,
  mapSupabaseActivityToApp,
  mapSupabaseSubmissionToApp
} from './type-mapping';
import { User, Course, Section, Activity, Submission } from '@/types';

// Database operations using Supabase
export const database = {
  users: {
    async getAll(): Promise<User[]> {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data.map(mapSupabaseUserToApp);
    },

    async getById(id: string): Promise<User | null> {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseUserToApp(data) : null;
    },

    async getByUsername(username: string): Promise<User | null> {
      const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseUserToApp(data) : null;
    },

    async create(user: Omit<User, 'id'> & { password: string }): Promise<User> {
      const { data, error } = await supabase.from('users').insert([{
        ...user,
        password: user.password
      }]).select().single();
      if (error) throw error;
      return mapSupabaseUserToApp(data);
    },

    async update(id: string, updates: Partial<User>): Promise<User> {
      const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return mapSupabaseUserToApp(data);
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    },
  },

  courses: {
    async getAll(): Promise<Course[]> {
      const { data, error } = await supabase.from('courses').select(`
        *,
        instructor:users(username, name)
      `);
      if (error) throw error;
      return data.map(mapSupabaseCourseToApp);
    },

    async getById(id: string): Promise<Course | null> {
      const { data, error } = await supabase.from('courses').select(`
        *,
        instructor:users(username, name)
      `).eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseCourseToApp(data) : null;
    },

    async getByCode(code: string): Promise<Course | null> {
      const { data, error } = await supabase.from('courses').select('*').eq('code', code).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseCourseToApp(data) : null;
    },

    async create(course: Omit<Course, 'id'>): Promise<Course> {
      const { data, error } = await supabase.from('courses').insert([course]).select().single();
      if (error) throw error;
      return mapSupabaseCourseToApp(data);
    },

    async update(id: string, updates: Partial<Course>): Promise<Course> {
      const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return mapSupabaseCourseToApp(data);
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    },
  },

  sections: {
    async getAll(): Promise<Section[]> {
      const { data, error } = await supabase.from('sections').select('*');
      if (error) throw error;
      return data.map(mapSupabaseSectionToApp);
    },

    async getByCourseId(courseId: string): Promise<Section[]> {
      const { data, error } = await supabase.from('sections').select('*').eq('course_id', courseId).order('order', { ascending: true });
      if (error) throw error;
      return data.map(mapSupabaseSectionToApp);
    },

    async getById(id: string): Promise<Section | null> {
      const { data, error } = await supabase.from('sections').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseSectionToApp(data) : null;
    },

    async create(section: Omit<Section, 'id'>): Promise<Section> {
      const { data, error } = await supabase.from('sections').insert([section]).select().single();
      if (error) throw error;
      return mapSupabaseSectionToApp(data);
    },

    async update(id: string, updates: Partial<Section>): Promise<Section> {
      const { data, error } = await supabase.from('sections').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return mapSupabaseSectionToApp(data);
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('sections').delete().eq('id', id);
      if (error) throw error;
    },
  },

  activities: {
    async getAll(): Promise<Activity[]> {
      const { data, error } = await supabase.from('activities').select('*');
      if (error) throw error;
      return data.map(mapSupabaseActivityToApp);
    },

    async getBySectionId(sectionId: string): Promise<Activity[]> {
      const { data, error } = await supabase.from('activities').select('*').eq('section_id', sectionId);
      if (error) throw error;
      return data.map(mapSupabaseActivityToApp);
    },

    async getById(id: string): Promise<Activity | null> {
      const { data, error } = await supabase.from('activities').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseActivityToApp(data) : null;
    },

    async create(activity: Omit<Activity, 'id'>): Promise<Activity> {
      const { data, error } = await supabase.from('activities').insert([activity]).select().single();
      if (error) throw error;
      return mapSupabaseActivityToApp(data);
    },

    async update(id: string, updates: Partial<Activity>): Promise<Activity> {
      const { data, error } = await supabase.from('activities').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return mapSupabaseActivityToApp(data);
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
    },
  },

  submissions: {
    async getAll(): Promise<Submission[]> {
      const { data, error } = await supabase.from('submissions').select(`
        *,
        student:users(name)
      `);
      if (error) throw error;
      return data.map(mapSupabaseSubmissionToApp);
    },

    async getByActivityId(activityId: string): Promise<Submission[]> {
      const { data, error } = await supabase.from('submissions').select(`
        *,
        student:users(name)
      `).eq('activity_id', activityId);
      if (error) throw error;
      return data.map(mapSupabaseSubmissionToApp);
    },

    async getByStudentId(studentId: string): Promise<Submission[]> {
      const { data, error } = await supabase.from('submissions').select(`
        *,
        student:users(name)
      `).eq('student_id', studentId);
      if (error) throw error;
      return data.map(mapSupabaseSubmissionToApp);
    },

    async getById(id: string): Promise<Submission | null> {
      const { data, error } = await supabase.from('submissions').select(`
        *,
        student:users(name)
      `).eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseSubmissionToApp(data) : null;
    },

    async create(submission: Omit<Submission, 'id'>): Promise<Submission> {
      const { data, error } = await supabase.from('submissions').insert([submission]).select(`
        *,
        student:users(name)
      `).single();
      if (error) throw error;
      return mapSupabaseSubmissionToApp(data);
    },

    async update(id: string, updates: Partial<Submission>): Promise<Submission> {
      const { data, error } = await supabase.from('submissions').update(updates).eq('id', id).select(`
        *,
        student:users(name)
      `).single();
      if (error) throw error;
      return mapSupabaseSubmissionToApp(data);
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('submissions').delete().eq('id', id);
      if (error) throw error;
    },
  },
};

// Server-side database operations
export const serverDatabase = {
  users: {
    async getAll(cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data.map(mapSupabaseUserToApp);
    },

    async getById(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseUserToApp(data) : null;
    },

    async getByUsername(username: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseUserToApp(data) : null;
    },

    async create(user: Omit<User, 'id'> & { password: string }, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('users').insert([{
        ...user,
        password: user.password
      }]).select().single();
      if (error) throw error;
      return mapSupabaseUserToApp(data);
    },

    async update(id: string, updates: Partial<User>, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return mapSupabaseUserToApp(data);
    },

    async delete(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    },
  },

  courses: {
    async getAll(cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('courses').select(`
        *,
        instructor:users(username, name)
      `);
      if (error) throw error;
      return data.map(mapSupabaseCourseToApp);
    },

    async getById(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('courses').select(`
        *,
        instructor:users(username, name)
      `).eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseCourseToApp(data) : null;
    },

    async getByCode(code: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('courses').select('*').eq('code', code).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseCourseToApp(data) : null;
    },

    async create(course: Omit<Course, 'id'>, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('courses').insert([course]).select().single();
      if (error) throw error;
      return mapSupabaseCourseToApp(data);
    },

    async update(id: string, updates: Partial<Course>, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return mapSupabaseCourseToApp(data);
    },

    async delete(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    },
  },

  sections: {
    async getAll(cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('sections').select('*');
      if (error) throw error;
      return data.map(mapSupabaseSectionToApp);
    },

    async getByCourseId(courseId: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('sections').select('*').eq('course_id', courseId).order('order', { ascending: true });
      if (error) throw error;
      return data.map(mapSupabaseSectionToApp);
    },

    async getById(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('sections').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseSectionToApp(data) : null;
    },

    async create(section: Omit<Section, 'id'>, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('sections').insert([section]).select().single();
      if (error) throw error;
      return mapSupabaseSectionToApp(data);
    },

    async update(id: string, updates: Partial<Section>, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('sections').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return mapSupabaseSectionToApp(data);
    },

    async delete(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from('sections').delete().eq('id', id);
      if (error) throw error;
    },
  },

  activities: {
    async getAll(cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('activities').select('*');
      if (error) throw error;
      return data.map(mapSupabaseActivityToApp);
    },

    async getBySectionId(sectionId: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('activities').select('*').eq('section_id', sectionId);
      if (error) throw error;
      return data.map(mapSupabaseActivityToApp);
    },

    async getById(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('activities').select('*').eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseActivityToApp(data) : null;
    },

    async create(activity: Omit<Activity, 'id'>, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('activities').insert([activity]).select().single();
      if (error) throw error;
      return mapSupabaseActivityToApp(data);
    },

    async update(id: string, updates: Partial<Activity>, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('activities').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return mapSupabaseActivityToApp(data);
    },

    async delete(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
    },
  },

  submissions: {
    async getAll(cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('submissions').select(`
        *,
        student:users(name)
      `);
      if (error) throw error;
      return data.map(mapSupabaseSubmissionToApp);
    },

    async getByActivityId(activityId: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('submissions').select(`
        *,
        student:users(name)
      `).eq('activity_id', activityId);
      if (error) throw error;
      return data.map(mapSupabaseSubmissionToApp);
    },

    async getByStudentId(studentId: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('submissions').select(`
        *,
        student:users(name)
      `).eq('student_id', studentId);
      if (error) throw error;
      return data.map(mapSupabaseSubmissionToApp);
    },

    async getById(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('submissions').select(`
        *,
        student:users(name)
      `).eq('id', id).single();
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data ? mapSupabaseSubmissionToApp(data) : null;
    },

    async create(submission: Omit<Submission, 'id'>, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('submissions').insert([submission]).select(`
        *,
        student:users(name)
      `).single();
      if (error) throw error;
      return mapSupabaseSubmissionToApp(data);
    },

    async update(id: string, updates: Partial<Submission>, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from('submissions').update(updates).eq('id', id).select(`
        *,
        student:users(name)
      `).single();
      if (error) throw error;
      return mapSupabaseSubmissionToApp(data);
    },

    async delete(id: string, cookiesObj?: any) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.from('submissions').delete().eq('id', id);
      if (error) throw error;
    },
  },
};