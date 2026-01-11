import { db } from './index';
import { sql } from 'drizzle-orm';

async function test() {
  try {
    console.log('Testing connection...');
    const result = await db.execute(sql`SELECT NOW()`);
    console.log('✅ Connection Successful!', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error(error);
    process.exit(1);
  }
}

test();
