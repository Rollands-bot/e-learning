'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  GraduationCap,
  ChevronRight,
  X
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'My Courses', icon: BookOpen, href: '/dashboard/courses', roles: ['STUDENT', 'TEACHER'] },
  { name: 'Course Management', icon: BookOpen, href: '/admin/courses', roles: ['ADMIN'] },
  { name: 'Grades', icon: GraduationCap, href: '/dashboard/grades', roles: ['STUDENT'] },
];

const ADMIN_ITEMS = [
  { name: 'User Management', icon: Users, href: '/admin/users' },
  { name: 'Site Administration', icon: Settings, href: '/admin/settings' },
];

interface SidebarProps {
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const visibleMenuItems = MENU_ITEMS.filter(item => 
    !item.roles || (role && item.roles.includes(role))
  );

  return (
    <>
      {/* Overlay with high-end blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-900/20 backdrop-blur-md z-[60] lg:hidden animate-in fade-in duration-500"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-[70] h-screen bg-white transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) w-[85vw] max-w-[320px] lg:w-64 lg:translate-x-0 border-r border-gray-100
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Desktop Header Logo (Fixed at top of sidebar) */}
        <div className="hidden lg:flex items-center h-20 px-6 border-b border-gray-50 bg-white">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 transition-transform group-hover:scale-105">
              <Image 
                src="/unipem.png" 
                alt="UNIPEM Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-brand-900 text-[11px] leading-tight uppercase tracking-tighter">UNIVERSITAS INSAN</span>
              <span className="font-black text-brand-primary text-[11px] leading-tight uppercase tracking-tighter">PEMBANGUNAN INDONESIA</span>
            </div>
          </Link>
        </div>

        {/* Mobile Header: Profile Card */}
        <div className="lg:hidden p-6 bg-brand-50/50 mb-2">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-900/20">
              U
            </div>
            <button onClick={onClose} className="p-2 bg-white shadow-sm rounded-xl text-brand-900">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-brand-900 leading-none">Portal Akademik</h3>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">LMS UNIPEM</p>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-1 overflow-y-auto h-[calc(100vh-180px)] lg:h-auto">
          <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
            Navigasi Utama
          </p>
          
          <div className="space-y-1">
            {visibleMenuItems.map((item, idx) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center justify-between px-4 py-3.5 text-sm font-bold text-gray-600 rounded-2xl hover:bg-brand-50 hover:text-brand-primary transition-all group
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 group-hover:bg-white rounded-xl transition-colors shadow-sm group-hover:shadow-md">
                    <item.icon size={20} />
                  </div>
                  {item.name}
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            ))}
          </div>

          {role === 'ADMIN' && (
            <div className="mt-8">
              <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Administrator
              </p>
              <div className="space-y-1">
                {ADMIN_ITEMS.map((item, idx) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-4 px-4 py-3.5 text-sm font-bold text-gray-600 rounded-2xl hover:bg-brand-50 hover:text-brand-primary transition-all group
                    `}
                  >
                    <div className="p-2 bg-gray-50 group-hover:bg-white rounded-xl transition-colors shadow-sm group-hover:shadow-md">
                      <item.icon size={20} />
                    </div>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Floating Bottom Card */}
        <div className="absolute bottom-6 left-6 right-6 lg:hidden">
          <div className="bg-gradient-to-br from-brand-900 to-brand-800 text-white p-5 rounded-[2rem] shadow-2xl shadow-brand-900/40 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <GraduationCap size={18} className="text-brand-300" />
                </div>
                <span className="font-black text-xs uppercase tracking-tight">SI-UNIPEM</span>
              </div>
              <p className="text-[9px] text-brand-200/80 leading-relaxed font-bold uppercase tracking-wider">
                Digital Campus Ecosystem
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
