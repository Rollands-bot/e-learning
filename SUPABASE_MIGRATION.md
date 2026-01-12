# Migrasi Database ke Supabase

Dokumen ini menjelaskan proses migrasi dari sistem database PostgreSQL saat ini ke Supabase.

## Perubahan yang Telah Dilakukan

1. **Instalasi Dependensi**:
   - `@supabase/supabase-js`: Klien utama untuk berinteraksi dengan Supabase
   - `@supabase/ssr`: Untuk mendukung Server-Side Rendering

2. **Struktur File Baru**:
   - `src/lib/supabase/client.ts`: Klien Supabase untuk lingkungan browser
   - `src/lib/supabase/server.ts`: Klien Supabase untuk lingkungan server
   - `src/lib/db/supabase-db.ts`: Operasi database menggunakan Supabase
   - `src/services/userService.ts`: Contoh layanan menggunakan Supabase
   - `src/services/courseService.ts`: Contoh layanan lain menggunakan Supabase
   - `src/lib/db/index.ts`: Titik masuk untuk operasi database (lama & baru)

3. **Konfigurasi**:
   - `supabase.config.ts`: Konfigurasi untuk migrasi Supabase
   - `.env.example`: Template variabel lingkungan untuk Supabase

## Cara Menggunakan Supabase

### Di Komponen Client-Side
```typescript
import { database } from '@/lib/db';

// Mendapatkan semua pengguna
const users = await database.users.getAll();

// Membuat pengguna baru
const newUser = await database.users.create({
  username: 'johndoe',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securePassword'
});
```

### Di Server Actions atau Route Handlers
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  // Gunakan klien supabase di sini
}
```

### Menggunakan Service
```typescript
import { userService } from '@/services/userService';

// Mendapatkan pengguna
const user = await userService.getUserById('user-id');
```

## Proses Migrasi

1. Buat proyek Supabase baru di https://supabase.com
2. Salin URL Proyek dan Anonymous Key
3. Tambahkan ke file `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
4. Jalankan migrasi schema ke Supabase
5. Uji fungsionalitas aplikasi

## Langkah-Langkah Selanjutnya

1. Lakukan migrasi data dari PostgreSQL lokal ke Supabase
2. Update semua route/handler yang menggunakan database lama
3. Hapus dependensi dan konfigurasi PostgreSQL jika sudah tidak digunakan
4. Lakukan pengujian menyeluruh terhadap seluruh fitur aplikasi