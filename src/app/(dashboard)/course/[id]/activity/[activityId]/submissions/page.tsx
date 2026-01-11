import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChevronLeft, Search, CheckCircle, Clock } from 'lucide-react';
import { getActivitySubmissionsAction } from '@/lib/actions/grade';
import { getActivityDetailAction } from '@/lib/actions/course';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function SubmissionsPage({ params }: { params: Promise<{ id: string; activityId: string }> }) {
  const { id, activityId } = await params;

  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_session');
  if (!userCookie) {
    redirect('/login');
  }
  const user = JSON.parse(userCookie.value);

  // Only allow teachers and admins to access grading
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [submissions, activity] = await Promise.all([
    getActivitySubmissionsAction(activityId),
    getActivityDetailAction(activityId)
  ]);

  // Server component rendering
  return (
    <div className="max-w-6xl mx-auto">
      <a 
        href={`/course/${id}`}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-primary mb-8 transition-colors"
      >
        <ChevronLeft size={14} /> Kembali ke Detail Tugas
      </a>

      <div className="mb-10">
        <h1 className="text-3xl font-black text-brand-900 uppercase tracking-tight leading-none mb-2">Pengajuan: {activity.title}</h1>
        <p className="text-brand-600 font-bold text-xs uppercase tracking-widest">{activity.section?.course?.title} • {activity.section?.course?.code}</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari Nama atau NPM..."
              className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-8 py-5">Identitas Mahasiswa</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Waktu Kirim</th>
                <th className="px-8 py-5 text-center">Nilai</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.length > 0 ? (
                submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-white font-black text-sm shadow-inner">
                          {sub.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-brand-900 uppercase tracking-tight leading-none mb-1">{sub.student?.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{sub.student?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {sub.status === 'GRADED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle size={12} /> Dinilai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <Clock size={12} /> Menunggu
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-gray-400 font-bold text-xs uppercase">
                      {new Date(sub.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-xl font-black ${sub.grade !== null ? 'text-brand-900' : 'text-gray-200'}`}>
                        {sub.grade !== null ? sub.grade : '--'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <a
                        href={`/course/${id}/activity/${activityId}/submissions/${sub.id}/grade`}
                        className="bg-brand-50 text-brand-primary px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                      >
                        {sub.status === 'GRADED' ? 'Re-Evaluasi' : 'Beri Nilai'}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-300 uppercase font-black text-xs tracking-[0.2em] italic">Belum ada pengajuan untuk tugas ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}