'use client';

import { useState } from 'react';
import { Plus, X, Save, Loader2, FileText, MessageSquare, ClipboardList } from 'lucide-react';
import { createSectionAction, createActivityAction } from '@/lib/actions/course';

export function AddSectionButton({ courseId }: { courseId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const res = await createSectionAction(courseId, title);
    if (res.success) {
      setIsOpen(false);
      setTitle('');
    }
    setIsPending(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-6 border-2 border-dashed border-brand-100 rounded-[2.5rem] text-xs font-black uppercase tracking-widest text-brand-primary hover:bg-brand-50 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={20} /> Tambah Topik/Minggu Baru
      </button>
    );
  }

  return (
    <div className="bg-white border-2 border-brand-primary rounded-[2.5rem] p-8 shadow-xl animate-in zoom-in-95">
      <h3 className="font-black text-brand-900 uppercase tracking-tight mb-4">Topik Baru</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Misal: Minggu 3: Dasar Database"
          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-bold"
          required
        />
        <div className="flex gap-3">
          <button type="submit" disabled={isPending} className="flex-1 bg-brand-primary text-white py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2">
            {isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Simpan
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-4 border border-gray-100 rounded-xl font-black uppercase text-xs text-gray-400">Batal</button>
        </div>
      </form>
    </div>
  );
}

export function AddActivityButton({ courseId, sectionId }: { courseId: string, sectionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'FILE',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const res = await createActivityAction(courseId, { ...formData, sectionId });
    if (res.success) {
      setIsOpen(false);
      setFormData({ title: '', type: 'FILE', description: '' });
    }
    setIsPending(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 py-4 border-2 border-dashed border-gray-100 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-brand-50 hover:text-brand-primary hover:border-brand-primary/20 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Tambah aktivitas atau materi
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-brand-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-brand-50/30">
          <h3 className="font-black text-brand-900 uppercase tracking-tight">Tambah Aktivitas</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'FILE', icon: FileText, label: 'Materi' },
              { id: 'ASSIGNMENT', icon: ClipboardList, label: 'Tugas' },
              { id: 'FORUM', icon: MessageSquare, label: 'Forum' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFormData({...formData, type: t.id})}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  formData.type === t.id ? 'border-brand-primary bg-brand-50 text-brand-primary' : 'border-gray-100 text-gray-400 hover:bg-gray-50'
                }`}
              >
                <t.icon size={20} />
                <span className="text-[10px] font-black uppercase">{t.label}</span>
              </button>
            ))}
          </div>
          <input 
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Judul Aktivitas..."
            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 font-bold"
          />
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Deskripsi singkat (opsional)..."
            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 h-24"
          />
          <button type="submit" disabled={isPending} className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20">
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan Aktivitas
          </button>
        </form>
      </div>
    </div>
  );
}
