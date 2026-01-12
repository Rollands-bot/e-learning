# Security Checklist - Pre-Commit

## Pastikan tidak ada credential yang bocor:

- [x] File .env di-ignore oleh .gitignore
- [x] Tidak ada credential hard-coded dalam kode
- [x] Tidak ada API key dalam file konfigurasi
- [x] Tidak ada password dalam file konfigurasi
- [x] Semua credential hanya dalam environment variables

## File yang aman untuk di-commit:
- [x] .env.example (template kosong)
- [x] Konfigurasi aplikasi tanpa credential
- [x] Kode sumber tanpa credential
- [x] Dokumentasi

## Credential hanya boleh dalam environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- DATABASE_URL

Semua credential ini hanya akan diakses saat runtime, bukan dalam kode sumber.