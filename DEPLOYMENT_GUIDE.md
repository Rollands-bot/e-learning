# Deployment Guide: Vercel + Supabase

Dokumen ini menjelaskan langkah-langkah untuk melakukan deployment aplikasi ke Vercel dan migrasi database ke Supabase.

## 1. Deployment ke Vercel

### Persiapan
1. Pastikan repository telah siap dan semua dependensi terinstal
2. Pastikan konfigurasi Next.js sudah benar untuk lingkungan production

### Langkah-langkah Deployment
1. Push kode ke GitHub/GitLab/Bitbucket
2. Hubungkan repository ke akun Vercel Anda
3. Pada pengaturan proyek Vercel:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Root Directory: `/`
4. Tambahkan environment variables berikut:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_current_postgres_url (untuk kompatibilitas sementara)
   ```
5. Deploy

## 2. Setup Supabase

### Buat Proyek Baru
1. Kunjungi [https://supabase.com](https://supabase.com) dan buat akun
2. Buat proyek baru
3. Catat URL Proyek dan Anonymous Key

### Konfigurasi Database
1. Gunakan Drizzle untuk membuat migrasi schema ke Supabase
2. Jalankan perintah berikut untuk migrasi schema:
   ```bash
   npx drizzle-kit push --config=supabase.config.ts
   ```

### Konfigurasi Authentication
1. Di dashboard Supabase, aktifkan authentication providers yang dibutuhkan
2. Konfigurasi email templates jika menggunakan email OTP/password reset
3. Atur Row Level Security (RLS) untuk proteksi data

## 3. Migrasi Data

### Ekspor Data dari PostgreSQL Lokal
```bash
pg_dump your_local_database_url > backup.sql
```

### Impor ke Supabase
1. Gunakan psql untuk menghubungkan ke database Supabase:
   ```bash
   psql "your_supabase_connection_string" -f backup.sql
   ```
   
2. Alternatif: Gunakan Supabase Studio untuk import data

## 4. Konfigurasi Environment Variables di Vercel

Setelah migrasi selesai, perbarui environment variables di Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_supabase_connection_string (untuk server-side operations)
NODE_ENV=production
```

## 5. Testing

### Sebelum Migrasi Penuh
1. Uji aplikasi dengan konfigurasi dual (PostgreSQL + Supabase)
2. Bandingkan hasil query dari kedua database
3. Pastikan semua fitur berfungsi dengan baik

### Setelah Migrasi
1. Lakukan end-to-end testing
2. Uji semua fitur CRUD
3. Verifikasi autentikasi dan otorisasi
4. Uji error handling

## 6. Backup dan Recovery

### Supabase Backup
- Supabase menyediakan backup otomatis harian
- Backup disimpan selama 30 hari pada proyek gratis
- Untuk backup lanjutan, gunakan Point-in-Time Recovery

### Backup Manual
1. Gunakan pg_dump untuk backup manual:
   ```bash
   pg_dump "your_supabase_connection_string" > manual_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

## 7. Monitoring dan Optimasi

### Monitoring Kinerja
- Gunakan Supabase Analytics untuk memonitor query dan penggunaan
- Gunakan Vercel Analytics untuk monitoring traffic dan error

### Optimasi Database
- Tambahkan indeks pada kolom yang sering digunakan untuk query
- Gunakan stored procedures untuk operasi kompleks
- Gunakan Real-time subscriptions untuk fitur live

## 8. Troubleshooting

### Masalah Umum
1. **Connection Timeout**: Pastikan firewall Supabase mengizinkan koneksi
2. **Auth Issues**: Pastikan konfigurasi auth di Supabase sesuai
3. **Query Performance**: Gunakan query analyzer untuk mengidentifikasi slow queries

### Debugging
- Aktifkan logging di middleware untuk melihat jalannya request
- Gunakan browser dev tools untuk memonitor network requests ke Supabase
- Gunakan Supabase Logs untuk debugging server-side issues

## 9. Best Practices

1. Gunakan Row Level Security (RLS) untuk proteksi data
2. Implementasikan caching untuk data yang sering diakses
3. Gunakan stored procedures untuk operasi kompleks
4. Gunakan Real-time subscriptions untuk fitur live
5. Monitor penggunaan bandwidth dan connection limits
6. Gunakan branch untuk pengembangan fitur baru

## 10. Rollback Plan

Jika terjadi masalah kritis:
1. Kembalikan environment variables ke konfigurasi sebelum migrasi
2. Gunakan backup terbaru untuk mengembalikan database
3. Deploy ulang versi sebelum migrasi