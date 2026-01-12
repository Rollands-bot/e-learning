# Pre-Deployment Checklist

Gunakan checklist ini sebelum melakukan deployment ke production.

## 1. Kode dan Dependencies
- [ ] Semua dependensi terbaru dan aman (cek `npm audit`)
- [ ] Tidak ada console.log yang tidak perlu
- [ ] Semua TODOs telah diselesaikan atau ditandai untuk dikerjakan nanti
- [ ] Kode telah diformat dengan prettier/eslint
- [ ] Tidak ada fitur yang rusak atau tidak berfungsi

## 2. Database Migration
- [ ] Schema telah dimigrasikan ke Supabase
- [ ] Data telah dipindahkan dari PostgreSQL lokal ke Supabase
- [ ] Backup database telah dibuat sebelum migrasi
- [ ] Semua query berfungsi dengan baik di Supabase
- [ ] Row Level Security (RLS) telah dikonfigurasi dengan benar

## 3. Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL telah diatur
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY telah diatur
- [ ] SUPABASE_SERVICE_ROLE_KEY telah diatur
- [ ] DATABASE_URL menunjuk ke Supabase (untuk server-side operations)
- [ ] NODE_ENV diatur ke 'production'

## 4. Security
- [ ] Semua API routes telah dilindungi dengan middleware
- [ ] Validasi input telah diterapkan
- [ ] XSS dan CSRF protection telah diimplementasikan
- [ ] Authentication dan authorization berfungsi dengan baik
- [ ] Tidak ada credential yang hard-coded

## 5. Testing
- [ ] Unit tests telah dijalankan dan lulus semua
- [ ] Integration tests telah dijalankan dan lulus semua
- [ ] End-to-end tests telah dijalankan dan lulus semua
- [ ] Manual testing telah dilakukan untuk semua fitur utama
- [ ] Cross-browser compatibility telah diuji

## 6. Performance
- [ ] Aplikasi telah dioptimasi untuk production
- [ ] Bundle size telah diminimalkan
- [ ] Image optimization telah diterapkan
- [ ] Caching telah dikonfigurasi
- [ ] Database queries telah dioptimasi

## 7. Monitoring dan Logging
- [ ] Error tracking telah diimplementasikan
- [ ] Analytics telah dikonfigurasi
- [ ] Logging telah diatur untuk production
- [ ] Health check endpoint telah dibuat

## 8. Backup dan Recovery
- [ ] Prosedur backup telah ditentukan
- [ ] Prosedur recovery telah ditentukan
- [ ] Backup terbaru telah dibuat
- [ ] Backup telah diverifikasi dapat digunakan

## 9. Documentation
- [ ] Deployment guide telah diperbarui
- [ ] API documentation telah diperbarui
- [ ] User manual telah diperbarui
- [ ] Rollback procedure telah disiapkan

## 10. Post-Deployment
- [ ] Monitoring telah diaktifkan
- [ ] Alerting telah dikonfigurasi
- [ ] Smoke test telah dilakukan setelah deployment
- [ ] Team telah diberitahu tentang deployment

## 11. Rollback Plan
- [ ] Versi sebelumnya masih tersedia
- [ ] Database backup tersedia
- [ ] Prosedur rollback telah ditentukan
- [ ] Tim mengetahui prosedur rollback