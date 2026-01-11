'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function loginAction(username: string) {
  try {
    // 1. Cari user berdasarkan username (NPM/NIP)
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user) {
      return { success: false, message: 'NPM/NIP tidak terdaftar.' };
    }

    // 2. Set Cookie Sesi (Simulasi simple tanpa JWT untuk saat ini)
    const sessionData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    (await cookies()).set('user_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 minggu
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, message: 'Terjadi kesalahan sistem.' };
  }
}

export async function logoutAction() {
  (await cookies()).delete('user_session');
}
