import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_URL!, // Gunakan environment variable untuk koneksi Supabase
  },
  migrations: {
    prefix: 'supabase',
  },
  // Hanya gunakan ini saat ingin membuat migrasi baru untuk Supabase
  // Jangan gunakan saat ingin mengelola schema lokal
  // migrations: {
  //   tableName: "migrations",
  //   schema: "public",
  //   folder: "./drizzle",
  // },
});