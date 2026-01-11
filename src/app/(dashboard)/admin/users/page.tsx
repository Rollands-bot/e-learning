'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
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
  Filter,
  CheckCircle2,
  X,
  Save,
  Loader2
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // State untuk Modal
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
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
        return <span className="px-2 py-1 bg-brand-900 text-white rounded-md text-[10px] font-bold tracking-wider">ADMIN</span>;
      case 'TEACHER':
        return <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded-md text-[10px] font-bold tracking-wider">DOSEN</span>;
      case 'STUDENT':
        return <span className="px-2 py-1 bg-brand-50 text-brand-600 rounded-md text-[10px] font-bold tracking-wider">MAHASISWA</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-sm">Kelola data mahasiswa, dosen, dan administrator sistem.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-800 transition-colors shadow-lg shadow-brand-900/10"
        >
          <UserPlus size={18} />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Pengguna</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-brand-primary">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dosen Aktif</p>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {users.filter(u => u.role === 'TEACHER').length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mahasiswa</p>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {users.filter(u => u.role === 'STUDENT').length}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama, email, atau NPM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
          <div className="flex gap-2 text-[#14532d]">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white appearance-none cursor-pointer font-bold"
            >
              <option value="ALL">Semua Peran</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Dosen</option>
              <option value="STUDENT">Mahasiswa</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4">Informasi Pengguna</th>
                <th className="px-6 py-4">Peran</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner"
                          style={{ backgroundColor: '#14532d' }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{user.username} • {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-brand-600 font-bold text-[10px] uppercase tracking-wider">
                        <CheckCircle2 size={14} /> Aktif
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-brand-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-brand-50/30">
              <h3 className="font-black text-brand-900 uppercase tracking-tight">
                {currentUser?.id ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-brand-900 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={currentUser?.name || ''}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                  placeholder="Contoh: Dr. John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-900 uppercase tracking-widest ml-1">NPM / NIP</label>
                  <input 
                    type="text" 
                    required
                    value={currentUser?.username || ''}
                    onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                    placeholder="2021001"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-900 uppercase tracking-widest ml-1">Peran</label>
                  <select 
                    value={currentUser?.role || 'STUDENT'}
                    onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-bold"
                  >
                    <option value="STUDENT">Mahasiswa</option>
                    <option value="TEACHER">Dosen</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-brand-900 uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={currentUser?.email || ''}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                  placeholder="user@unipem.ac.id"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-brand-primary text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-brand-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}