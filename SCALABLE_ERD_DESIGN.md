# Desain ERD untuk Sistem E-Learning yang Scalable

## Gambaran Umum

Sistem E-Learning yang skalabel memerlukan desain database yang fleksibel, efisien, dan mampu menangani pertumbuhan pengguna serta konten yang signifikan. Berikut adalah desain ERD yang direkomendasikan untuk sistem Anda.

## Entitas Utama dan Relasi

### 1. Users (Pengguna)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `username` (UNIQUE) - NIM/NIP untuk otentikasi
  - `name` - Nama lengkap pengguna
  - `email` (UNIQUE) - Alamat email
  - `role` - ENUM (ADMIN, TEACHER, STUDENT)
  - `password` - Hash password
  - `avatar` - URL gambar profil
  - `created_at` - Timestamp pembuatan akun
  - `updated_at` - Timestamp pembaruan terakhir
  - `last_login` - Timestamp login terakhir

### 2. Courses (Kursus)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `code` (UNIQUE) - Kode kursus (misal: CS101)
  - `title` - Judul kursus
  - `description` - Deskripsi kursus
  - `category` - Kategori kursus
  - `instructor_id` (Foreign Key ke Users) - Pengajar kursus
  - `thumbnail` - URL gambar thumbnail
  - `is_active` - Status aktif/nonaktif kursus
  - `max_students` - Batas maksimum peserta
  - `created_at` - Timestamp pembuatan
  - `updated_at` - Timestamp pembaruan

### 3. Enrollments (Pendaftaran Kursus)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (Foreign Key ke Users) - Mahasiswa yang mendaftar
  - `course_id` (Foreign Key ke Courses) - Kursus yang didaftari
  - `enrollment_date` - Tanggal pendaftaran
  - `status` - ENUM (ACTIVE, COMPLETED, DROPPED)
  - `progress_percentage` - Persentase kemajuan kursus
  - `created_at` - Timestamp pendaftaran

### 4. Sections (Bagian Kursus)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `course_id` (Foreign Key ke Courses) - Kursus induk
  - `title` - Judul bagian
  - `description` - Deskripsi bagian
  - `order` - Urutan penampilan
  - `is_published` - Status publikasi
  - `created_at` - Timestamp pembuatan
  - `updated_at` - Timestamp pembaruan

### 5. Activities (Aktivitas Pembelajaran)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `section_id` (Foreign Key ke Sections) - Bagian induk
  - `type` - ENUM (LECTURE, ASSIGNMENT, QUIZ, FORUM, RESOURCE, LINK)
  - `title` - Judul aktivitas
  - `description` - Deskripsi aktivitas
  - `content_url` - URL konten (video, dokumen, dll)
  - `due_date` - Batas waktu (untuk tugas/quiz)
  - `points_possible` - Poin maksimum (jika ada penilaian)
  - `is_required` - Status wajib/tidak
  - `is_published` - Status publikasi
  - `created_at` - Timestamp pembuatan
  - `updated_at` - Timestamp pembaruan

### 6. Submissions (Pengumpulan Tugas)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `activity_id` (Foreign Key ke Activities) - Aktivitas terkait
  - `student_id` (Foreign Key ke Users) - Mahasiswa pengumpul
  - `status` - ENUM (PENDING, SUBMITTED, GRADED, LATE)
  - `grade` - Nilai (0-100)
  - `feedback` - Umpan balik instruktur
  - `file_url` - URL file yang dikumpulkan
  - `submitted_at` - Timestamp pengumpulan
  - `graded_at` - Timestamp penilaian
  - `grader_id` (Foreign Key ke Users) - Instruktur penilai
  - `created_at` - Timestamp pembuatan

### 7. Announcements (Pengumuman)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `course_id` (Foreign Key ke Courses) - Kursus terkait
  - `author_id` (Foreign Key ke Users) - Penulis pengumuman
  - `title` - Judul pengumuman
  - `content` - Isi pengumuman
  - `is_pinned` - Status pin (penting)
  - `published_at` - Timestamp publikasi
  - `created_at` - Timestamp pembuatan

### 8. Discussions (Diskusi/Forum)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `course_id` (Foreign Key ke Courses) - Kursus terkait
  - `author_id` (Foreign Key ke Users) - Penulis diskusi
  - `title` - Judul diskusi
  - `content` - Isi diskusi
  - `is_pinned` - Status pin
  - `is_locked` - Status terkunci
  - `created_at` - Timestamp pembuatan
  - `updated_at` - Timestamp pembaruan

### 9. Discussion_Replies (Balasan Diskusi)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `discussion_id` (Foreign Key ke Discussions) - Diskusi induk
  - `parent_reply_id` (Self-referencing) - Balasan terhadap balasan lain
  - `author_id` (Foreign Key ke Users) - Penulis balasan
  - `content` - Isi balasan
  - `created_at` - Timestamp pembuatan

### 10. Progress_Tracking (Pelacakan Kemajuan)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `user_id` (Foreign Key ke Users) - Pengguna yang dilacak
  - `course_id` (Foreign Key ke Courses) - Kursus terkait
  - `activity_id` (Foreign Key ke Activities) - Aktivitas terkait
  - `status` - ENUM (NOT_STARTED, IN_PROGRESS, COMPLETED)
  - `completion_date` - Tanggal penyelesaian
  - `time_spent` - Waktu yang dihabiskan (dalam detik)
  - `created_at` - Timestamp pembuatan
  - `updated_at` - Timestamp pembaruan

## Indeks yang Disarankan untuk Skalabilitas

### Indeks pada Tabel Utama
```sql
-- Indeks pada Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Indeks pada Courses
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_code ON courses(code);

-- Indeks pada Enrollments
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_enrollments_course_status ON enrollments(course_id, status);

-- Indeks pada Activities
CREATE INDEX idx_activities_section ON activities(section_id);
CREATE INDEX idx_activities_type ON activities(type);

-- Indeks pada Submissions
CREATE INDEX idx_submissions_activity_student ON submissions(activity_id, student_id);
CREATE INDEX idx_submissions_student_activity ON submissions(student_id, activity_id);
```

## Prinsip Desain untuk Skalabilitas

### 1. Normalisasi Data
- Struktur database dirancang secara normal untuk menghindari redundansi
- Relasi antar entitas dibuat dengan foreign key yang tepat

### 2. Indeks Strategis
- Indeks dibuat pada kolom yang sering digunakan dalam WHERE, JOIN, dan ORDER BY
- Hindari pembuatan indeks berlebihan karena dapat memperlambat operasi INSERT/UPDATE

### 3. Partisi Tabel
- Untuk tabel besar seperti Submissions dan Progress_Tracking, pertimbangkan partisi berdasarkan tanggal
- Contoh: Partisi bulanan atau tahunan untuk data historis

### 4. Denormalisasi Terbatas
- Beberapa kolom denormalisasi dapat ditambahkan untuk mengoptimalkan query umum
- Misalnya: `current_grade` di tabel Enrollments untuk menyimpan nilai terbaru tanpa perlu join kompleks

### 5. Pengelolaan ID
- Menggunakan UUID untuk ID memudahkan scaling horizontal dan penggabungan data dari berbagai sumber
- Alternatif: Gunakan auto-incrementing ID dengan strategi sharding jika diperlukan

### 6. Soft Delete
- Gunakan kolom `deleted_at` alih-alih DELETE fisik untuk data penting
- Ini memungkinkan pemulihan data dan menjaga integritas historis

## Optimasi untuk Performa

### 1. Caching
- Gunakan caching untuk data statis seperti daftar kursus, informasi pengguna
- Implementasi caching tingkat aplikasi dan database

### 2. Query Optimization
- Gunakan eager loading untuk relasi yang sering diakses bersama
- Gunakan pagination untuk dataset besar
- Hindari N+1 query problem

### 3. Database Connection Pooling
- Gunakan connection pooling untuk mengelola koneksi database secara efisien
- Sesuaikan ukuran pool berdasarkan beban aplikasi

## Rekomendasi untuk Supabase

### 1. Row Level Security (RLS)
- Aktifkan RLS untuk mengontrol akses data berdasarkan peran pengguna
- Contoh: Mahasiswa hanya bisa mengakses data mereka sendiri dan kursus yang diikuti

### 2. Database Functions
- Gunakan fungsi database untuk operasi kompleks yang sering digunakan
- Contoh: Fungsi untuk menghitung rata-rata nilai atau persentase kemajuan

### 3. Real-time Features
- Manfaatkan fitur real-time Supabase untuk notifikasi, obrolan, atau kolaborasi
- Cocok untuk forum diskusi atau sistem notifikasi

## Kesimpulan

Desain ERD ini dirancang untuk mendukung pertumbuhan sistem E-Learning dari segi jumlah pengguna, kursus, dan konten. Dengan struktur yang fleksibel dan indeks yang tepat, sistem akan mampu menangani beban kerja yang meningkat sambil tetap menjaga performa yang baik.