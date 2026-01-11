'use client';

import { Settings, Globe, Shield, Bell, Database, Save } from 'lucide-react';

export default function SiteAdministrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrasi Situs</h1>
        <p className="text-gray-500 text-sm">Konfigurasi global untuk LMS UNIPEM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Settings Navigation */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg font-bold text-sm text-left">
            <Globe size={18} /> Umum
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm text-left transition-colors">
            <Shield size={18} /> Keamanan
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm text-left transition-colors">
            <Bell size={18} /> Notifikasi
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm text-left transition-colors">
            <Database size={18} /> Server & Database
          </button>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Pengaturan Umum</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nama Situs Full</label>
              <input 
                type="text" 
                defaultValue="LMS Universitas Insan Pembangunan Indonesia"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nama Singkat Situs</label>
              <input 
                type="text" 
                defaultValue="LMS UNIPEM"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Metode Pendaftaran</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none bg-white">
                <option>Hanya oleh Admin</option>
                <option>Mandiri dengan Konfirmasi Email</option>
                <option>Terbuka (Tanpa Konfirmasi)</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-brand-700 transition-colors">
                <Save size={18} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
