# Dokumentasi Arsitektur LMS UNIPEM (Moodle-Style)

Proyek ini adalah MVP Learning Management System untuk **Universitas Insan Pembangunan Indonesia (UNIPEM)** yang dibangun dengan Next.js 14 App Router, menggunakan pendekatan **Frontend-First**.

## 1. Arsitektur Folder (Next.js App Router)

```text
src/
├── app/                  # Routing & Layouts
│   ├── (auth)/           # Route Group untuk Login
│   ├── (dashboard)/      # Route Group untuk App (Sidebar + Header)
│   │   ├── dashboard/    # Daftar Course
│   │   ├── course/[id]/  # Course Main View (Moodle-Style)
│   │   └── activity/     # Detail Aktivitas (Forum, Assignment, File)
│   ├── admin/            # Dashboard Admin
│   ├── layout.tsx        # Root Configuration
│   └── middleware.ts     # Role-Based Protection & Auth Simulation
├── components/           # UI Components
│   ├── layout/           # Header, Sidebar
│   ├── course/           # ActivityIcon, SectionCard
│   └── dashboard/        # CourseCard
├── lib/                  # Utilities & Constants
│   └── constants/        # Mock Data (Course, User, Activity)
├── types/                # TypeScript Interfaces (Models)
└── middleware.ts         # Auth Guard
```

## 2. Mapping Konsep Moodle → Frontend

| Konsep Moodle | Implementasi Frontend |
| :--- | :--- |
| **Course** | Entitas utama di `/course/[id]` |
| **Section/Topic** | Akordeon/List di halaman course |
| **Activity** | Item di dalam section (Polimorfik: File, Assignment, Forum) |
| **Turn Editing On** | Toggle State `isEditing` di UI (Hanya Dosen/Admin) |
| **Enrollment** | Simulasi via Mock Data rute `/dashboard` |

## 3. Mock Data Structure (Contoh)

```typescript
// src/types/index.ts
export interface Course {
  id: string;
  code: string;
  title: string;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  activities: Activity[];
}
```

## 4. API Contract (Planned)

### Courses
- `GET /api/courses` - Mendapatkan daftar kursus user yang sedang login.
- `GET /api/courses/:id` - Mendapatkan detail struktur kursus (section & activity).

### Activities
- `GET /api/activities/:id` - Mendapatkan detail konten (misal: deskripsi tugas).
- `POST /api/activities/:id/submissions` - Upload jawaban tugas (Multipart/Form-Data).
- `GET /api/activities/:id/submissions` - (Dosen) Melihat daftar jawaban mahasiswa.

### Auth
- `POST /api/auth/login` - Login & mendapatkan JWT.
- `GET /api/auth/me` - Validasi session & role.

## 5. Integrasi Database & Backend (Future)

Untuk menghubungkan frontend ini ke backend nanti, stack yang direkomendasikan adalah:

1.  **Database**: **PostgreSQL** (Relational) - Sangat cocok untuk struktur data Moodle yang kompleks (relasi antara user, course, section, activity, dan grade).
2.  **ORM**: **Drizzle ORM** - Untuk query yang type-safe dan migrasi database yang ringan.
3.  **Storage**: **Cloudflare R2** atau AWS S3 untuk menyimpan file PDF materi dan file submission mahasiswa.
4.  **API**: Cloudflare Workers (Hono.js) atau Next.js Route Handlers yang terhubung ke PostgreSQL.

## 6. Catatan Pengembangan (Solo Developer)

- Fokus pada **Consistency**: Gunakan tipe data yang sama antara Mock Data dan nanti di Database.
- **UI Simplicity**: Jangan terlalu banyak animasi berat, Moodle user lebih mementingkan kejelasan struktur konten.
- **Role Simulation**: Gunakan toggle role di profile (untuk development) agar bisa melihat perspektif Dosen dan Mahasiswa dengan cepat.
