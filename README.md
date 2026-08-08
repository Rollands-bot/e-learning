# Sistem E-Learning UNIPI

Skripsi Wahyudiyanto (NPM 2023804163) — Sistem Informasi, Universitas Insan Pembangunan Indonesia.

**Dokumen acuan:** `2023804163_Wahyudiyanto_skripsi.docx`. Seluruh struktur basis data,
istilah, dan alur sistem di repositori ini mengikuti dokumen tersebut — khususnya
Tabel 4.15–4.19 (struktur tabel), Tabel 3.3 (kebutuhan fungsional), dan Tabel 3.9
(rancangan pengujian).

> `PRD.md` adalah dokumen lama dari fase awal dan **sudah tidak sesuai** dengan skripsi
> (masih memakai username, 8 tabel, dan Bootstrap). Gunakan skripsi sebagai acuan.

## Struktur

```
.
├── backend/                   # REST API (Go + Gin + GORM + PostgreSQL)
├── frontend/                  # SvelteKit + Tailwind CSS
└── frontend-bootstrap-lama/   # arsip front-end lama (HTML + Bootstrap), tidak dipakai
```

## Status

| Bagian | Status |
|---|---|
| Basis data 5 tabel (3 master + 2 transaksi) | ✅ sesuai Tabel 4.15–4.19 |
| Autentikasi surel + JWT + RBAC | ✅ |
| Pengelolaan pengguna (administrator) | ✅ |
| Pengelolaan mata kuliah + dosen pengampu | ✅ |
| Materi: unggah, ubah, hapus, unduh | ✅ |
| Tugas + pengumpulan + status otomatis | ✅ |
| Penilaian + umpan balik + rekap nilai | ✅ |
| Pengujian Black Box Tabel 3.9 | ✅ 14 skenario lulus |
| Front-end SvelteKit + Tailwind | ✅ 11 halaman (Gambar 4.5–4.15) |

### Peta halaman ke gambar rancangan

| Rute | Gambar | Akses |
|---|---|---|
| `/login` | 4.5 Halaman Login | publik |
| `/dasbor` | 4.6 / 4.9 / 4.13 Dasbor per peran | semua |
| `/pengguna` | 4.7 Kelola Data Pengguna | administrator |
| `/mata-kuliah` | 4.8 Kelola Data Mata Kuliah | semua |
| `/mata-kuliah/[id]` | 4.10 Kelola Materi + 4.11 Form Tugas | semua |
| `/tugas/[id]` | 4.12 Daftar Pengumpulan & Penilaian + 4.14 Pengumpulan | semua |
| `/nilai` | 4.15 Halaman Nilai Mahasiswa | mahasiswa |

## Stack

| Layer | Teknologi |
|---|---|
| Bahasa | Go 1.22+ |
| Framework | Gin v1.10 |
| ORM | GORM v1.25 |
| Basis data | PostgreSQL 15+ |
| Auth | JWT (golang-jwt/v5) + bcrypt cost 10 |
| Front-end (rencana) | SvelteKit + Tailwind CSS |

## Menjalankan backend

### 1. Buat basis data

```bash
psql -d postgres -c "CREATE DATABASE elearning_unipi;"
```

### 2. Konfigurasi

```bash
cd backend && cp .env.example .env
```

Sesuaikan `DB_USER`/`DB_PASSWORD`, lalu **ganti `JWT_SECRET`**:

```bash
openssl rand -base64 48
```

### 3. Jalankan

```bash
cd backend && go mod tidy && go run cmd/server/main.go
```

Keluaran yang diharapkan:

```
✓ koneksi PostgreSQL berhasil
✓ auto-migrate selesai (5 tabel)
✓ akun administrator awal dibuat: admin@unipem.ac.id
✓ server jalan di http://localhost:8080
```

Sistem **tidak menyediakan registrasi mandiri** — seluruh akun dibuat administrator
(Tabel 4.4 nomor 2). Akun administrator pertama dibuat otomatis dari `ADMIN_EMAIL`
dan `ADMIN_PASSWORD` di `.env` ketika basis data masih kosong.

## Menjalankan front-end

```bash
cd frontend && npm install && npm run dev
```

Buka `http://localhost:5173`. Back-end harus sudah berjalan di port 8080 —
origin `http://localhost:5173` sudah masuk daftar CORS pada `.env.example`.

Build produksi menghasilkan berkas statis di `frontend/build/`:

```bash
cd frontend && npm run build
```

> Bila ada style Tailwind yang tidak muncul setelah menambah berkas `.svelte`
> baru, **restart dev server**. Tailwind v4 memindai berkas sumber untuk
> menentukan CSS yang dihasilkan dan tidak selalu menangkap berkas yang dibuat
> setelah server berjalan.

## Pengujian Black Box

Menjalankan seluruh 14 skenario Tabel 3.9 terhadap server yang sedang berjalan:

```bash
bash backend/scripts/uji-blackbox.sh
```

Skrip memerlukan `curl` dan `jq`, serta basis data kosong agar surel uji tidak bentrok.

## Ringkasan REST API

Base URL: `http://localhost:8080/api`

### Autentikasi

| Method | Endpoint | Peran | Keterangan |
|---|---|---|---|
| POST | `/auth/login` | – | `{email, password}` → `{token, user}` |
| GET | `/auth/me` | semua | Profil pengguna aktif |
| POST | `/auth/logout` | semua | Token dihapus di sisi klien |

### Pengelolaan Pengguna (administrator)

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/pengguna?peran=dosen` | Daftar pengguna, dapat difilter peran |
| POST | `/pengguna` | Tambah pengguna |
| GET | `/pengguna/:id` | Detail |
| PUT | `/pengguna/:id` | Ubah sebagian field |
| DELETE | `/pengguna/:id` | Hapus |

### Mata Kuliah

| Method | Endpoint | Peran | Keterangan |
|---|---|---|---|
| GET | `/mata-kuliah` | semua | Dosen otomatis hanya melihat yang diampu |
| GET | `/mata-kuliah/:id` | semua | Detail |
| POST | `/mata-kuliah` | administrator | Tambah + tetapkan dosen pengampu |
| PUT | `/mata-kuliah/:id` | administrator | Ubah |
| DELETE | `/mata-kuliah/:id` | administrator | Hapus |

### Materi

| Method | Endpoint | Peran | Keterangan |
|---|---|---|---|
| GET | `/mata-kuliah/:id/materi` | semua | Daftar materi |
| POST | `/mata-kuliah/:id/materi` | dosen pengampu | multipart: `judul`, `deskripsi`, `berkas` |
| PUT | `/materi/:id` | dosen pengampu | multipart, `berkas` opsional |
| DELETE | `/materi/:id` | dosen pengampu | Hapus + berkas fisik |
| GET | `/materi/:id/unduh` | semua | Unduh berkas |

### Tugas

| Method | Endpoint | Peran | Keterangan |
|---|---|---|---|
| GET | `/mata-kuliah/:id/tugas` | semua | Daftar tugas |
| GET | `/tugas/:id` | semua | Detail |
| POST | `/mata-kuliah/:id/tugas` | dosen pengampu | `{judul, deskripsi, batas_waktu, nilai_maksimum}` |
| PUT | `/tugas/:id` | dosen pengampu | Ubah |
| DELETE | `/tugas/:id` | dosen pengampu | Hapus |

### Pengumpulan & Penilaian

| Method | Endpoint | Peran | Keterangan |
|---|---|---|---|
| POST | `/tugas/:id/pengumpulan` | mahasiswa | multipart `berkas`; status ditetapkan sistem |
| GET | `/tugas/:id/pengumpulan-saya` | mahasiswa | Status pengumpulan sendiri |
| GET | `/tugas/:id/pengumpulan` | dosen pengampu | Seluruh mahasiswa + status |
| PUT | `/pengumpulan/:id/nilai` | dosen pengampu | `{nilai, umpan_balik}`, divalidasi ≤ nilai maksimum |
| GET | `/pengumpulan/:id/unduh` | dosen pengampu / pemilik | Unduh berkas jawaban |
| GET | `/saya/nilai` | mahasiswa | Rekap nilai per mata kuliah |
| GET | `/mata-kuliah/:id/rekap-nilai` | dosen pengampu | Rekap seluruh mahasiswa |

### Format response

Sukses:

```json
{ "data": {}, "message": "ok" }
```

Gagal:

```json
{ "error": "pesan untuk pengguna", "code": "kode_mesin" }
```

## Catatan implementasi

- **Status pengumpulan dihitung server** (KF-08), tidak pernah diterima dari front-end.
  `belum` → `terkumpul`/`terlambat` (berdasarkan `batas_waktu`) → `dinilai`.
- **Berkas tidak disajikan sebagai direktori statis.** Pengunduhan melewati handler
  sehingga tetap diperiksa token JWT.
- **Nama berkas di disk diganti UUID**, mencegah path traversal dan tabrakan nama.
  Nama unduhan diturunkan dari judul materi karena Tabel 4.17 tidak memiliki kolom
  nama berkas asli.
- **Relasi mahasiswa ↔ mata kuliah tidak ada** karena rancangan lima tabel tidak
  memuat tabel enrollment. Seluruh mahasiswa melihat seluruh mata kuliah.
