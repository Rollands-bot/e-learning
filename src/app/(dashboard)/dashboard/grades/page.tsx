import { getStudentGradesAction } from '@/lib/actions/grade';
import { getCoursesAction } from '@/lib/actions/course';
import { cookies } from 'next/headers';
import { Award, TrendingUp, BookOpen, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GradesPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_session');
  if (!userCookie) return null;
  const user = JSON.parse(userCookie.value);

  const dbCourses = await getCoursesAction();
  const dbGrades = await getStudentGradesAction(user.id);

  // Map mata kuliah ke nilai mahasiswa ini
  const processedGrades = dbCourses.map((course: import('@/types').Course) => {
    // Cari semua nilai untuk kursus ini
    const courseGrades = dbGrades.filter((g: any) => g.activity?.section?.courseId === course.id);
    
    let totalGrade = 0;
    let count = 0;
    let latestFeedback = '';

    courseGrades.forEach((g: any) => {
      if (g.grade !== null) {
        totalGrade += g.grade;
        count++;
        latestFeedback = g.feedback || latestFeedback;
      }
    });

    const averageGrade = count > 0 ? Math.round(totalGrade / count) : null;

    return {
      id: course.id,
      name: course.title,
      code: course.code,
      grade: averageGrade,
      feedback: latestFeedback,
      status: averageGrade ? (averageGrade >= 80 ? 'A' : averageGrade >= 70 ? 'B' : 'C') : 'In Progress'
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-900 uppercase tracking-tight">Nilai Akademik</h1>
          <p className="text-gray-500 text-sm font-medium">Laporan hasil belajar untuk <span className="text-brand-primary font-bold">{user.name}</span> ({user.username})</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
          <Clock size={16} className="text-brand-primary" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Semester Ganjil 2025/2026</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-brand-900 to-brand-800 p-6 rounded-[2rem] text-white shadow-xl shadow-brand-900/20 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black text-brand-200 uppercase tracking-[0.2em] mb-2">Indeks Prestasi</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black">3.85</span>
            <span className="text-brand-300 text-sm font-bold mb-1">/ 4.00</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-primary">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">SKS Selesai</p>
            <p className="text-2xl font-black text-brand-900">18 <span className="text-xs text-gray-300">/ 22</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <Award size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status Akademik</p>
            <p className="text-xl font-black text-green-700 uppercase tracking-tighter">Aktif / Normal</p>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <h3 className="font-black text-brand-900 uppercase tracking-tight text-sm">Kartu Hasil Studi Sementara</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                <th className="px-8 py-5">Kode & Mata Kuliah</th>
                <th className="px-8 py-5 text-center">Nilai Angka</th>
                <th className="px-8 py-5 text-center">Grade</th>
                <th className="px-8 py-5">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {processedGrades.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-brand-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-black text-brand-900 leading-none mb-1 uppercase tracking-tight">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{item.code}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-xl font-black ${item.grade ? 'text-brand-900' : 'text-gray-200'}`}>
                      {item.grade || '--'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {item.grade ? (
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black tracking-widest ${
                        item.status === 'A' ? 'bg-green-100 text-green-700' : 
                        item.status === 'B' ? 'bg-brand-100 text-brand-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-300 uppercase italic">On Process</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-gray-500 italic max-w-xs truncate" title={item.feedback}>
                      {item.feedback || 'Belum ada catatan dari dosen.'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
