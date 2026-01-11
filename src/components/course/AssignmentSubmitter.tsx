'use client';

import { useState } from 'react';
import { Upload, Send, Loader2 } from 'lucide-react';
import { submitAssignmentAction } from '@/lib/actions/grade';
import { useRouter } from 'next/navigation';

export default function AssignmentSubmitter({ activityId, studentId, hasSubmitted }: { activityId: string, studentId: string, hasSubmitted: boolean }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSub = async () => {
    setIsPending(true);
    const res = await submitAssignmentAction({ activityId, studentId });
    if (res.success) {
      alert('Tugas berhasil dikirim!');
      router.refresh();
    }
    setIsPending(false);
  };

  return (
    <div className="bg-brand-50/50 border border-brand-100 rounded-[2.5rem] p-10 mt-8">
      <h3 className="font-black text-brand-900 uppercase tracking-tight mb-8 flex items-center gap-3">
        <Upload size={22} /> {hasSubmitted ? 'Kirim Ulang Tugas' : 'Status Pengajuan Anda'}
      </h3>
      
      {!hasSubmitted && (
        <div 
          onClick={handleSub}
          className="border-2 border-dashed border-brand-200 rounded-[2rem] p-12 text-center bg-white hover:bg-brand-50 transition-all cursor-pointer group"
        >
          {isPending ? (
            <Loader2 className="animate-spin mx-auto text-brand-primary mb-4" size={48} />
          ) : (
            <Upload className="mx-auto text-brand-200 group-hover:text-brand-primary mb-4 transition-colors" size={48} />
          )}
          <p className="text-sm font-black text-brand-900 uppercase tracking-tight">Klik di sini untuk mengirim tugas</p>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Format PDF • Simulasi Upload</p>
        </div>
      )}

      {hasSubmitted && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-green-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status Pengiriman</p>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Terkirim</span>
          </div>
          <button 
            onClick={handleSub}
            disabled={isPending}
            className="w-full py-4 bg-white border border-brand-100 text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
            Perbarui Pengiriman (Kirim Ulang)
          </button>
        </div>
      )}
    </div>
  );
}
