// src/lib/db/index.ts
// Entry point untuk semua operasi database
// File ini akan menentukan apakah menggunakan Drizzle (lama) atau Supabase (baru)
import { db } from './client'; // Drizzle instance (lama)
import { database as supabaseDb } from './supabase-db'; // Supabase instance (baru)

// Ekspor instance database berdasarkan konfigurasi
// Untuk saat ini, kita ekspor keduanya untuk kompatibilitas
// Nantinya, semua operasi akan menggunakan supabaseDb

export { 
  db, // Drizzle instance - untuk kompatibilitas sementara
  supabaseDb as database // Supabase instance - untuk penggunaan baru
};

// Ekspor schema untuk digunakan di tempat lain
export * from './schema';