import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// Alamat back-end diambil dari environment agar tidak perlu mengubah kode
// ketika sistem diterapkan di luar mesin pengembangan. Lihat `.env.example`.
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080/api';

const KUNCI_TOKEN = 'elearning_token';
const KUNCI_USER = 'elearning_user';

export const sesi = {
  token: () => (browser ? localStorage.getItem(KUNCI_TOKEN) : null),
  user: () => {
    if (!browser) return null;
    const mentah = localStorage.getItem(KUNCI_USER);
    try {
      return mentah ? JSON.parse(mentah) : null;
    } catch {
      return null;
    }
  },
  simpan(token, user) {
    localStorage.setItem(KUNCI_TOKEN, token);
    localStorage.setItem(KUNCI_USER, JSON.stringify(user));
  },
  perbaruiUser(user) {
    localStorage.setItem(KUNCI_USER, JSON.stringify(user));
  },
  masuk: () => browser && !!localStorage.getItem(KUNCI_TOKEN),
  keluar() {
    localStorage.removeItem(KUNCI_TOKEN);
    localStorage.removeItem(KUNCI_USER);
    goto('/login');
  }
};

/**
 * Pembungkus fetch tunggal untuk seluruh pemanggilan API.
 *
 * Token disisipkan otomatis, dan response 401 langsung mengakhiri sesi —
 * sehingga token yang kedaluwarsa tidak menyisakan halaman setengah termuat.
 */
export async function panggil(jalur, { method = 'GET', body = null, form = null } = {}) {
  const headers = { Accept: 'application/json' };
  const token = sesi.token();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${jalur}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined)
  });

  if (res.status === 401 && jalur !== '/auth/login') {
    sesi.keluar();
    throw new Error('Sesi berakhir, silakan masuk kembali');
  }

  let muatan = null;
  try {
    muatan = await res.json();
  } catch {
    /* response tanpa badan JSON, misalnya unduhan */
  }

  if (!res.ok) {
    const galat = new Error(muatan?.error || `Kesalahan ${res.status}`);
    galat.kode = muatan?.code;
    galat.status = res.status;
    throw galat;
  }
  return muatan;
}

/** Mengunduh berkas terproteksi lewat blob agar header Authorization tetap terkirim. */
export async function unduh(jalur, namaCadangan = 'berkas') {
  const res = await fetch(`${API_BASE}${jalur}`, {
    headers: { Authorization: `Bearer ${sesi.token()}` }
  });
  if (!res.ok) throw new Error('Gagal mengunduh berkas');

  const disposisi = res.headers.get('Content-Disposition') || '';
  const cocok = disposisi.match(/filename="?([^"]+)"?/);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cocok ? cocok[1] : namaCadangan;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

let konfigurasiTersimpan = null;

/**
 * Batas ukuran dan format berkas menurut back-end.
 *
 * Nilainya di-cache satu kali per sesi halaman: aturan ini berasal dari
 * konfigurasi server dan tidak berubah selama server berjalan, sehingga tidak
 * perlu diambil ulang setiap kali form unggah dibuka.
 */
export async function konfigurasi() {
  if (!konfigurasiTersimpan) {
    konfigurasiTersimpan = (await panggil('/konfigurasi')).data;
  }
  return konfigurasiTersimpan;
}

export const api = {
  login: (email, password) => panggil('/auth/login', { method: 'POST', body: { email, password } }),
  saya: () => panggil('/auth/me'),

  daftarPengguna: (peran) => panggil(`/pengguna${peran ? `?peran=${peran}` : ''}`),
  buatPengguna: (data) => panggil('/pengguna', { method: 'POST', body: data }),
  ubahPengguna: (id, data) => panggil(`/pengguna/${id}`, { method: 'PUT', body: data }),
  hapusPengguna: (id) => panggil(`/pengguna/${id}`, { method: 'DELETE' }),

  daftarMataKuliah: () => panggil('/mata-kuliah'),
  detailMataKuliah: (id) => panggil(`/mata-kuliah/${id}`),
  buatMataKuliah: (data) => panggil('/mata-kuliah', { method: 'POST', body: data }),
  ubahMataKuliah: (id, data) => panggil(`/mata-kuliah/${id}`, { method: 'PUT', body: data }),
  hapusMataKuliah: (id) => panggil(`/mata-kuliah/${id}`, { method: 'DELETE' }),

  daftarMateri: (mkId) => panggil(`/mata-kuliah/${mkId}/materi`),
  unggahMateri: (mkId, form) => panggil(`/mata-kuliah/${mkId}/materi`, { method: 'POST', form }),
  hapusMateri: (id) => panggil(`/materi/${id}`, { method: 'DELETE' }),

  daftarTugas: (mkId) => panggil(`/mata-kuliah/${mkId}/tugas`),
  buatTugas: (mkId, data) => panggil(`/mata-kuliah/${mkId}/tugas`, { method: 'POST', body: data }),
  hapusTugas: (id) => panggil(`/tugas/${id}`, { method: 'DELETE' }),

  kumpulkan: (tugasId, form) => panggil(`/tugas/${tugasId}/pengumpulan`, { method: 'POST', form }),
  pengumpulanSaya: (tugasId) => panggil(`/tugas/${tugasId}/pengumpulan-saya`),
  daftarPengumpulan: (tugasId) => panggil(`/tugas/${tugasId}/pengumpulan`),
  beriNilai: (id, data) => panggil(`/pengumpulan/${id}/nilai`, { method: 'PUT', body: data }),

  nilaiSaya: () => panggil('/saya/nilai'),
  rekapNilai: (mkId) => panggil(`/mata-kuliah/${mkId}/rekap-nilai`)
};
