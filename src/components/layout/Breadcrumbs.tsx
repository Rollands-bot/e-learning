'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);

    // Mapping label khusus
    if (segment === 'dashboard') label = 'Beranda';
    if (segment === 'admin') label = 'Administrasi';
    if (segment === 'users') label = 'Manajemen Pengguna';
    if (segment === 'grades') label = 'Nilai Akademik';
    if (segment === 'courses' && pathSegments[index-1] === 'dashboard') label = 'Kursus Saya';
    if (segment === 'course') return null; // Skip kata "course" di breadcrumb
    if (segment === 'activity') return null; // Skip kata "activity" di breadcrumb
    
    // Jika segment adalah UUID (biasanya ID course/activity), buat label generic
    if (segment.length > 20) label = 'Detail'; 

    return { label, href };
  }).filter(Boolean);

  if (pathname === '/dashboard' || pathname === '/') return null;

  return (
    <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
      <Link href="/dashboard" className="hover:text-brand-primary flex items-center gap-1">
        <Home size={14} />
        <span>Beranda</span>
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={12} className="text-gray-300" />
          <Link 
            href={crumb!.href} 
            className={`hover:text-brand-primary ${index === breadcrumbs.length - 1 ? 'font-bold text-gray-900 pointer-events-none' : ''}`}
          >
            {crumb!.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
