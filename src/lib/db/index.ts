import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Jangan lempar error jika sedang dalam proses build produksi dan env tidak ada
if (!connectionString && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ DATABASE_URL tidak ditemukan. Skip koneksi untuk build.');
}

// Hanya inisialisasi client jika connectionString ada
export const client = connectionString ? postgres(connectionString, { prepare: false }) : null;
export const db = client ? drizzle(client, { schema }) : null as any;
