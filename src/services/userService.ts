// src/services/userService.ts
import { database } from '@/lib/db';
import { User } from '@/types';

export interface CreateUserInput {
  username: string;
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  avatar?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  avatar?: string;
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      return await database.users.getAll();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      return await database.users.getById(id);
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await database.users.getByUsername(username);
    } catch (error) {
      console.error(`Error fetching user with username ${username}:`, error);
      throw error;
    }
  },

  async createUser(userData: CreateUserInput): Promise<User> {
    try {
      return await database.users.create({
        ...userData,
        role: userData.role || 'STUDENT'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(id: string, userData: UpdateUserInput): Promise<User> {
    try {
      return await database.users.update(id, userData);
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error;
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await database.users.delete(id);
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw error;
    }
  }
};