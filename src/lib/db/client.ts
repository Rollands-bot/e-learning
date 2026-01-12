// src/lib/db/client.ts
// File ini menyediakan antarmuka database yang bisa diganti saat build time
// Dalam migrasi ke Supabase, kita tetap menyimpan file ini untuk kompatibilitas sementara
// Nantinya semua operasi database akan menggunakan src/lib/db/supabase-db.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Hanya inisialisasi koneksi jika bukan saat build time atau jika DATABASE_URL tersedia
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_URL;

let dbInstance: any = null;

if (connectionString && process.env.NODE_ENV !== 'production') {
  // Saat development
  const client = postgres(connectionString, { prepare: false });
  dbInstance = drizzle(client, { schema });
} else if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && connectionString) {
  // Saat runtime di production
  const client = postgres(connectionString, { prepare: false });
  dbInstance = drizzle(client, { schema });
} else {
  // Saat build time, gunakan mock
  dbInstance = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => [Promise.resolve([])],
          returning: () => [Promise.resolve({ id: 'mock' })],
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoNothing: () => ({
          returning: () => [Promise.resolve({ id: 'mock' })],
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(),
      }),
    }),
    delete: () => ({
      where: () => Promise.resolve(),
    }),
    query: {
      users: {
        findMany: () => Promise.resolve([]),
      },
      submissions: {
        findMany: () => Promise.resolve([]),
      },
      courses: {
        findMany: () => Promise.resolve([]),
      },
      sections: {
        findMany: () => Promise.resolve([]),
      },
      activities: {
        findMany: () => Promise.resolve([]),
      },
    },
  };
}

export { dbInstance as db };