import { Course, User } from "@/types";

export const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', name: 'Admin UNIPEM', email: 'admin@unipem.ac.id', role: 'ADMIN' },
  { id: '2', username: '19850101', name: 'Dr. Budi Santoso', email: 'budi@unipem.ac.id', role: 'TEACHER' },
  { id: '3', username: '2021001', name: 'Andi Mahasiswa', email: 'andi@student.unipem.ac.id', role: 'STUDENT' },
  { id: '4', username: '19850102', name: 'Dr. Siti Aminah', email: 'siti@unipem.ac.id', role: 'TEACHER' },
  { id: '5', username: '2021002', name: 'Budi Cahyadi', email: 'budi.c@student.unipem.ac.id', role: 'STUDENT' },
  { id: '6', username: '2021003', name: 'Dedi Kurniawan', email: 'dedi.k@student.unipem.ac.id', role: 'STUDENT' },
  { id: '7', username: 'staff', name: 'Staff Akademik', email: 'akademik@unipem.ac.id', role: 'ADMIN' },
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'cs101',
    code: 'INF202',
    title: 'Pemrograman Web Lanjut',
    category: 'Teknik Informatika',
    instructor: 'Dr. Budi Santoso',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80',
    sections: [
      {
        id: 's1',
        title: 'Minggu 1: Pengenalan Next.js',
        description: 'Mempelajari dasar-dasar App Router dan Server Components.',
        activities: [
          { id: 'a1', type: 'FILE', title: 'Slide Materi 1: Arsitektur Next.js', contentUrl: '/files/materi1.pdf' },
          { id: 'a2', type: 'FORUM', title: 'Diskusi: Server vs Client Components' },
        ]
      },
      {
        id: 's2',
        title: 'Minggu 2: Tailwind CSS & UI Design',
        activities: [
          { 
            id: 'a3', 
            type: 'ASSIGNMENT', 
            title: 'Tugas 1: Slice UI Dashboard', 
            dueDate: '2026-01-20T23:59:00Z',
            description: 'Buatlah layout dashboard menggunakan Tailwind CSS.'
          },
        ]
      }
    ]
  },
  {
    id: 'cs102',
    code: 'INF301',
    title: 'Kecerdasan Buatan',
    category: 'Teknik Informatika',
    instructor: 'Dr. Siti Aminah',
    thumbnail: 'https://images.unsplash.com/photo-1555255707-c079664889ec?w=800&q=80',
    sections: []
  }
];
