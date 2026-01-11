import { db } from './index';
import * as schema from './schema';

async function check() {
  try {
    console.log('\n--- DAFTAR USER DI DATABASE ---');
    const allUsers = await db.select().from(schema.users);
    console.table(allUsers.map((u: any) => ({ id: u.id, username: u.username, name: u.name, role: u.role })));

    console.log('\n--- DAFTAR KURSUS DI DATABASE ---');
    const allCourses = await db.select().from(schema.courses);
    console.table(allCourses.map((c: any) => ({ id: c.id, code: c.code, title: c.title })));

    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal mengambil data:', error);
    process.exit(1);
  }
}

check();
