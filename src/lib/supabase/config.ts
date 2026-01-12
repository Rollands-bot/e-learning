// src/lib/supabase/config.ts
// File ini menyediakan konfigurasi Supabase yang aman saat runtime

export const getSupabaseConfig = () => {
  if (typeof window === 'undefined') {
    // Server-side
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase environment variables are not set on server');
      return null;
    }
    
    return {
      supabaseUrl,
      supabaseAnonKey,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    };
  } else {
    // Client-side
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase environment variables are not set on client');
      return null;
    }
    
    return {
      supabaseUrl,
      supabaseAnonKey
    };
  }
};

export const isSupabaseConfigured = (): boolean => {
  const config = getSupabaseConfig();
  return config !== null;
};