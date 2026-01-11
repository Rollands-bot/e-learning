import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user_session');
  const { pathname } = request.nextUrl;

  // 1. Jika ke halaman login tapi sudah login, redirect ke dashboard
  if (pathname === '/login') {
    if (userCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Proteksi rute (jika tidak ada cookie)
  if (!userCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = JSON.parse(userCookie.value);

  // 3. Role-based protection
  if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Khusus grading/submissions (Dosen/Admin saja)
  if (pathname.includes('/submissions') && user.role === 'STUDENT') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/course/:path*',
    '/admin/:path*',
    '/login',
  ],
};
