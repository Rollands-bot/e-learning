'use client';

import { useState, useEffect } from 'react';
import { 
  getUsersAction, 
  upsertUserAction, 
  deleteUserAction 
} from '@/lib/actions/user';
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  CheckCircle2,
  X,
  Save,
  Loader2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    setIsLoadingData(true);
    const data = await getUsersAction();
    setUsers(data);
    setIsLoadingData(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = (user?: any) => {
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser({ name: '', email: '', username: '', role: 'STUDENT' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await upsertUserAction(currentUser);
    if (result.success) {
      await fetchUsers();
      setIsModalOpen(false);
      setCurrentUser(null);
    } else {
      alert(result.message);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      const result = await deleteUserAction(id);
      if (result.success) {
        await fetchUsers();
      } else {
        alert(result.message);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-3 py-1 bg-brand-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">ADMIN</span>;
      case 'TEACHER':
        return <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-lg text-[9px] font-black uppercase tracking-widest">DOSEN</span>;
      case 'STUDENT':
        return <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-[9px] font-black uppercase tracking-widest">MAHASISWA</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 font-jakarta">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-brand-900 uppercase tracking-tight">Manajemen Pengguna</h1>
          <p className="text-gray-500 font-medium">Kelola data mahasiswa, dosen, dan administrator.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-3 bg-brand-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-800 transition-all shadow-xl shadow-brand-900/20 active:scale-95"
        >
          <UserPlus size={18} />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row gap-6 justify-between items-center">
          <div className="relative flex-1 max-w-lg w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama, email, atau NPM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-[2rem] text-sm focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold"
            />
          </div>
          <div className="flex gap-3 text-[#14532d] w-full sm:w-auto">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto px-6 py-4 border border-gray-200 rounded-[2rem] text-xs focus:outline-none bg-white font-black uppercase tracking-widest cursor-pointer shadow-sm"
            >
              <option value="ALL">Semua Peran</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Dosen</option>
              <option value="STUDENT">Mahasiswa</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Informasi Pengguna</th>
                <th className="px-10 py-6">Peran</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoadingData ? (
                <tr><td colSpan={4} className="px-10 py-20 text-center font-black text-gray-300 uppercase animate-pulse">Sinkronisasi Database...</td></tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-50/30 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl" style={{ backgroundColor: '#14532d' }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-brand-900 uppercase tracking-tight text-base mb-1">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.username} • {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-10 py-8">
                      <span className="flex items-center gap-2 text-brand-600 font-black text-[10px] uppercase tracking-widest">
                        <CheckCircle2 size={16} /> Aktif
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-3 text-gray-400 hover:text-brand-primary hover:bg-white rounded-2xl shadow-sm transition-all border border-transparent hover:border-gray-100"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-white rounded-2xl shadow-sm transition-all border border-transparent hover:border-gray-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-10 py-20 text-center text-gray-400 uppercase font-black text-xs italic tracking-widest">Tidak ada data pengguna</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl border border-brand-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-brand-50/30">
              <h3 className="font-black text-brand-900 uppercase tracking-tight text-xl">
                {currentUser?.id ? 'Ubah Informasi' : 'Registrasi User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-900 uppercase tracking-[0.2em] ml-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={currentUser?.name || ''}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold"
                  placeholder="Nama Lengkap dengan Gelar"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-900 uppercase tracking-[0.2em] ml-2">NPM / NIP</label>
                  <input 
                    type="text" 
                    required
                    value={currentUser?.username || ''}
                    onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-900 uppercase tracking-[0.2em] ml-2">Peran</label>
                  <select 
                    value={currentUser?.role || 'STUDENT'}
                    onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as any})}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-black uppercase tracking-widest cursor-pointer"
                  >
                    <option value="STUDENT">Mahasiswa</option>
                    <option value="TEACHER">Dosen</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-900 uppercase tracking-[0.2em] ml-2">Email Institusi</label>
                <input 
                  type="email" 
                  required
                  value={currentUser?.email || ''}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all font-bold"
                  placeholder="user@unipem.ac.id"
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-brand-primary text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-900 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-900/30 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Simpan Data User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
