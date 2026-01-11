'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, or, ilike } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getUsersAction(search?: string, role?: string) {
  try {
    let query = db.select().from(users);
    
    // Filter logic can be added here if needed for more complex queries
    const allUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)]
    });

    return allUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function upsertUserAction(data: any) {
  try {
    if (data.id) {
      // Update
      await db.update(users).set({
        name: data.name,
        username: data.username,
        email: data.email,
        role: data.role,
      }).where(eq(users.id, data.id));
    } else {
      // Create
      await db.insert(users).values({
        name: data.name,
        username: data.username,
        email: data.email,
        role: data.role,
        password: 'password123', // Default password
      });
    }
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error upserting user:', error);
    return { success: false, message: 'Gagal menyimpan data pengguna.' };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Gagal menghapus pengguna.' };
  }
}
