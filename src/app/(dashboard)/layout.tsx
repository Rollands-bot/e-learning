'use client';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { getCookie } from 'cookies-next';
import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const userCookie = getCookie('user_session');
    if (userCookie) {
      setUser(JSON.parse(userCookie as string));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white font-jakarta">
      <Header user={user} onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar 
        role={user?.role} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <main className="lg:pl-64 pt-16 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}
