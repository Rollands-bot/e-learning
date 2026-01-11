import Link from 'next/link';
import { ChevronLeft, FileText, Upload, Send, MessageSquare, ExternalLink, Download } from 'lucide-react';
import { cookies } from 'next/headers';
import { getActivityDetailAction } from '@/lib/actions/course';
import { getStudentGradesAction } from '@/lib/actions/grade';
import AssignmentSubmitter from '@/components/course/AssignmentSubmitter';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string; activityId: string }>;
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { id, activityId } = await params;
  const activity = await getActivityDetailAction(activityId);

  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_session');
  const user = userCookie ? JSON.parse(userCookie.value) : {};
  const isStudent = user.role === 'STUDENT';

  // Jika mahasiswa, cari apakah sudah ada nilai/submission untuk aktivitas ini
  let studentSubmission = null;
  if (isStudent && activity) {
    const studentGrades = await getStudentGradesAction(user.id);
    studentSubmission = studentGrades.find(g => g.activityId === activity.id);
  }

  if (!activity) return <div className="p-12 text-center font-bold text-gray-400">Aktivitas tidak ditemukan.</div>;

  const renderActivityContent = () => {
    switch (activity.type) {
      case 'FILE':
        return (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-12 text-center shadow-sm">
            <div className="w-24 h-24 bg-brand-50 text-brand-700 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileText size={48} />
            </div>
            <h3 className="text-2xl font-black text-brand-900 uppercase tracking-tight mb-2">{activity.title}</h3>
            <p className="text-gray-400 font-medium mb-8">Dokumen materi kuliah telah tersedia untuk diunduh.</p>
            <a 
              href={activity.contentUrl || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-brand-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/20 active:scale-95"
            >
              <Download size={20} /> Unduh Materi (PDF)
            </a>
          </div>
        );

      case 'FORUM':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="font-black text-brand-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                <MessageSquare size={24} className="text-brand-600" /> Diskusi Kelas
              </h3>
              <div className="text-center py-20 border-2 border-dashed border-gray-50 rounded-[2rem]">
                <p className="text-gray-300 font-bold uppercase tracking-widest text-xs mb-6">Belum ada topik diskusi yang dimulai</p>
                <button className="bg-brand-primary text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/10">
                  Mulai Diskusi Baru
                </button>
              </div>
            </div>
          </div>
        );

      case 'ASSIGNMENT':
        return (
          <div className="space-y-8">
            <div className="prose prose-green max-w-none bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
              <h3 className="text-brand-900 font-black uppercase tracking-tight mb-4">Instruksi Tugas</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                {activity.description || 'Silakan kerjakan tugas sesuai dengan materi yang telah disampaikan. Unggah file dalam format PDF.'}
              </p>
            </div>

            {isStudent ? (
              <AssignmentSubmitter 
                activityId={activity.id} 
                studentId={user.id} 
                hasSubmitted={!!studentSubmission} 
              />
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-10 text-center">
                <h3 className="font-black text-brand-900 uppercase tracking-tight mb-2">Ringkasan Penilaian Mahasiswa</h3>
                <p className="text-sm text-gray-400 font-medium mb-10">Kelola dan berikan feedback pada tugas yang telah dikirim.</p>
                <Link 
                  href={`/course/${id}/activity/${activityId}/submissions`}
                  className="inline-block bg-brand-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/20"
                >
                  Lihat Semua Pengajuan
                </Link>
              </div>
            )}
          </div>
        );

      default:
        return <div className="p-12 text-center text-gray-400 uppercase font-black text-xs tracking-widest">Tipe aktivitas belum didukung.</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        href={`/course/${id}`}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-primary mb-8 transition-colors group"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Mata Kuliah
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            activity.type === 'FILE' ? 'bg-brand-primary text-white' :
            activity.type === 'FORUM' ? 'bg-brand-100 text-brand-700' :
            'bg-red-500 text-white'
          }`}>
            {activity.type === 'FILE' && <FileText size={28} />}
            {activity.type === 'FORUM' && <MessageSquare size={28} />}
            {activity.type === 'ASSIGNMENT' && <FileText size={28} />}
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-900 uppercase tracking-tight leading-none">{activity.title}</h1>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mt-2">
              {activity.section?.course?.title}
            </p>
          </div>
        </div>
      </div>

      <div className="pb-20">
        {renderActivityContent()}
      </div>
    </div>
  );
}
