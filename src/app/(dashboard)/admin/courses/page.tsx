'use client';

import { useState, useEffect } from 'react';
import { 
  getCoursesAction, 
  createCourseAction, 
  deleteCourseAction 
} from '@/lib/actions/course';
import { getUsersAction } from '@/lib/actions/user';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Edit2, 
  Trash2, 
  User, 
  X, 
  Save, 
  Loader2,
  Layers
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AdminCourseManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    category: 'Teknik Informatika',
    instructorId: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    const [coursesData, usersData] = await Promise.all([
      getCoursesAction(),
      getUsersAction()
    ]);
    setCourses(coursesData);
    setTeachers(usersData.filter((u: { role: string }) => u.role === 'TEACHER'));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createCourseAction(formData);
    if (res.success) {
      await fetchData();
      setIsModalOpen(false);
      setFormData({ code: '', title: '', category: 'Teknik Informatika', instructorId: '' });
    } else {
      alert(res.message);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus mata kuliah ini? Seluruh data di dalamnya akan ikut terhapus.')) {
      const res = await deleteCourseAction(id);
      if (res.success) await fetchData();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-900 uppercase tracking-tight">Manajemen Mata Kuliah</h1>
          <p className="text-gray-500 text-sm font-medium">Kelola kurikulum dan penugasan dosen pengampu.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-brand-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/20 active:scale-95"
        >
          <Plus size={18} /> Tambah MK Baru
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari Kode atau Nama MK..."
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
                <th className="px-8 py-5">Kode & Judul MK</th>
                <th className="px-8 py-5">Dosen Pengampu</th>
                <th className="px-8 py-5 text-center">Topik</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-brand-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-700">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <p className="font-black text-brand-900 uppercase tracking-tight leading-none mb-1">{course.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.code} • {course.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-600 font-bold">
                        <User size={14} className="text-brand-primary" />
                        {course.instructor?.name || '-'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {course.sections?.length || 0} Topics
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/course/${course.id}`}
                          className="p-2.5 text-gray-400 hover:text-brand-primary hover:bg-white rounded-xl transition-all shadow-sm"
                        >
                          <Layers size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic font-medium">Belum ada mata kuliah ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Kursus */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-brand-100 overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-brand-50/30">
              <h3 className="font-black text-brand-900 uppercase tracking-tight">Buat Mata Kuliah</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-black text-brand-900 uppercase tracking-widest ml-1">Kode MK</label>
                  <input 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="INF101"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 font-bold uppercase"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-brand-900 uppercase tracking-widest ml-1">Nama Mata Kuliah</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Contoh: Algoritma"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-brand-900 uppercase tracking-widest ml-1">Kategori / Jurusan</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 font-bold"
                >
                  <option>Teknik Informatika</option>
                  <option>Sistem Informasi</option>
                  <option>Manajemen Informatika</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-brand-900 uppercase tracking-widest ml-1">Dosen Pengampu</label>
                <select 
                  required
                  value={formData.instructorId}
                  onChange={(e) => setFormData({...formData, instructorId: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 font-bold"
                >
                  <option value="">Pilih Dosen...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-gray-100 rounded-2xl text-xs font-black uppercase text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-900 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-900/20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan MK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
