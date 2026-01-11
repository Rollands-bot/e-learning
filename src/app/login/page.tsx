'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import { User, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('remembered_npm');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await loginAction(username);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('remembered_npm', username);
      } else {
        localStorage.removeItem('remembered_npm');
      }
      router.push('/dashboard');
      router.refresh();
    } else {
      setError(result.message || 'Login gagal.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50/30 px-4 py-12 sm:px-6 lg:px-8 font-jakarta">
      <div className="w-full max-w-sm sm:max-w-md space-y-8">
        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-brand-900/5 border border-brand-100 relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-colors"></div>
              <Image 
                src="/unipem.png" 
                alt="UNIPEM" 
                width={100} 
                height={100} 
                className="relative mx-auto drop-shadow-xl animate-float sm:w-[110px] sm:h-[110px]"
                priority
              />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider ml-1 text-brand-900">NPM / NIP</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-600" size={18} style={{ color: '#14532d' }} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan nomor induk..."
                  className="w-full pl-10 pr-4 py-3 bg-brand-50/30 border border-brand-100 rounded-xl text-sm focus:ring-2 focus:ring-[#14532d]/20 focus:border-[#14532d] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1 text-brand-900">
                <label className="text-xs font-black uppercase tracking-wider">Password</label>
                <a href="#" className="text-[10px] font-bold hover:underline" style={{ color: '#14532d' }}>Lupa Password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-600" size={18} style={{ color: '#14532d' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-brand-50/30 border border-brand-100 rounded-xl text-sm focus:ring-2 focus:ring-[#14532d]/20 focus:border-[#14532d] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center ml-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-brand-200 text-brand-primary focus:ring-brand-primary/20"
                />
                <span className="text-[11px] font-bold text-gray-500 group-hover:text-brand-900 transition-colors">Ingat Saya</span>
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#14532d' }}
              className="w-full text-white font-black py-3.5 rounded-xl shadow-lg shadow-brand-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  MEMVERIFIKASI...
                </>
              ) : 'LOGIN'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
            Universitas Insan Pembangunan Indonesia<br/>
            &copy; 2026 ICT Center UNIPEM
          </p>
        </div>
      </div>
    </div>
  );
}