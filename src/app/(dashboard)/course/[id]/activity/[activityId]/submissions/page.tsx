'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Search, CheckCircle, Clock, X, Save, Loader2, MessageSquare, User } from 'lucide-react';
import { getActivitySubmissionsAction, updateGradeAction } from '@/lib/actions/grade';
import { getActivityDetailAction } from '@/lib/actions/course';
import { useState, useEffect } from 'react';

export default function SubmissionsPage() {
  const { id, activityId } = useParams();
  const router = useRouter();
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activity, setActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const [subData, actData] = await Promise.all([
      getActivitySubmissionsAction(activityId as string),
      getActivityDetailAction(activityId as string)
    ]);
    setSubmissions(subData);
    setActivity(actData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activityId]);

  const filteredSubmissions = submissions.filter(sub => 
    sub.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.student?.username?.includes(searchTerm)
  );

  const handleOpenGrading = (sub: any) => {
    setSelectedSubmission({ ...sub, grade: sub.grade || 0 });
    setIsModalOpen(true);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await updateGradeAction(selectedSubmission.id, {
      grade: selectedSubmission.grade,
      feedback: selectedSubmission.feedback
    });
    
    if (res.success) {
      await fetchData();
      setIsModalOpen(false);
      alert('Nilai berhasil disimpan ke database!');
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Memuat Data Pengajuan...</div>;
  if (!activity) return <div className="p-12 text-center">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-primary mb-8 transition-colors"
      >
        <ChevronLeft size={14} /> Kembali ke Detail Tugas
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-black text-brand-900 uppercase tracking-tight leading-none mb-2">Pengajuan: {activity.title}</h1>
        <p className="text-brand-600 font-bold text-xs uppercase tracking-widest">{activity.section?.course?.title} • {activity.section?.course?.code}</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari Nama atau NPM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-brand-50/30 transition-colors group">
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
                      <button 
                        onClick={() => handleOpenGrading(sub)}
                        className="bg-brand-50 text-brand-primary px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        {sub.status === 'GRADED' ? 'Re-Evaluasi' : 'Beri Nilai'}
                      </button>
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

      {/* Modal Penilaian (Tetap menggunakan desain premium sebelumnya) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-brand-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-brand-50/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-brand-900/20">
                  {selectedSubmission?.student?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-brand-900 uppercase tracking-tight text-lg">Input Skor Akademik</h3>
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">
                    {selectedSubmission?.student?.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveGrade} className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-brand-900 uppercase tracking-[0.3em]">Grade (0-100)</label>
                  <span className="text-4xl font-black text-brand-primary">{selectedSubmission?.grade}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={selectedSubmission?.grade || 0}
                  onChange={(e) => setSelectedSubmission({...selectedSubmission, grade: parseInt(e.target.value)})}
                  className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-brand-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-900 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                  <MessageSquare size={14} /> Catatan Dosen
                </label>
                <textarea 
                  rows={4}
                  value={selectedSubmission?.feedback || ''}
                  onChange={(e) => setSelectedSubmission({...selectedSubmission, feedback: e.target.value})}
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all placeholder:text-gray-300 font-bold"
                  placeholder="Berikan saran membangun..."
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-5 bg-brand-primary text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-brand-900 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-900/30 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Kirim Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
