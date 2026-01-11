'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, LogOut } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: any;
  onMenuClick: () => void;
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 fixed top-0 w-full z-50 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Unique Staggered Hamburger Menu */}
        <button 
          onClick={onMenuClick}
          className="flex flex-col gap-1.5 p-3 -ml-2 hover:bg-brand-50 rounded-2xl lg:hidden transition-all active:scale-90 group"
        >
          <span className="w-6 h-0.5 bg-brand-900 rounded-full group-hover:w-4 transition-all" />
          <span className="w-4 h-0.5 bg-brand-primary rounded-full group-hover:w-6 transition-all" />
          <span className="w-5 h-0.5 bg-brand-900 rounded-full group-hover:w-3 transition-all" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 transition-transform group-hover:scale-105">
            <Image 
              src="/unipem.png" 
              alt="UNIPEM Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="hidden sm:block">
              <h1 className="text-[10px] sm:text-xs font-black text-brand-900 leading-none tracking-tighter uppercase">UNIVERSITAS INSAN</h1>
              <h1 className="text-[10px] sm:text-xs font-black text-brand-primary tracking-tighter uppercase">PEMBANGUNAN INDONESIA</h1>
            </div>
            <div className="sm:hidden">
              <h1 className="text-xs font-black text-brand-900 tracking-tighter">UNIPEM</h1>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <Bell size={20} />
        </button>
        
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold hover:bg-red-100 hover:text-red-600 transition-colors group relative"
            title="Klik untuk Logout"
          >
            <span className="group-hover:hidden">{user?.name.charAt(0)}</span>
            <LogOut size={18} className="hidden group-hover:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
