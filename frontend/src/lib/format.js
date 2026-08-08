/** Pemformatan tampilan: tanggal, ukuran berkas, dan label status. */

export function tanggal(nilai, denganJam = true) {
  if (!nilai) return '—';
  const d = new Date(nilai);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(denganJam ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

export function ukuran(kb) {
  if (!kb && kb !== 0) return '—';
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

/** Sisa waktu menuju batas pengumpulan, dibaca sekilas oleh mahasiswa. */
export function sisaWaktu(batas) {
  const selisih = new Date(batas).getTime() - Date.now();
  if (selisih <= 0) return { teks: 'Batas waktu terlewat', lewat: true };

  const jam = Math.floor(selisih / 3_600_000);
  if (jam < 24) return { teks: `${jam} jam lagi`, lewat: false, mendesak: true };
  return { teks: `${Math.floor(jam / 24)} hari lagi`, lewat: false };
}

export const STATUS = {
  belum: { label: 'Belum Dikumpulkan', kelas: 'bg-kertas-3 text-tinta-2 border-garis-2' },
  terkumpul: { label: 'Terkumpul', kelas: 'bg-pinus-3 text-pinus border-pinus/25' },
  terlambat: { label: 'Terlambat', kelas: 'bg-oker-2 text-oker border-oker/30' },
  dinilai: { label: 'Dinilai', kelas: 'bg-pinus text-kertas border-pinus' }
};

export const PERAN = {
  administrator: { label: 'Administrator', kelas: 'bg-bata-2 text-bata border-bata/25' },
  dosen: { label: 'Dosen', kelas: 'bg-pinus-3 text-pinus border-pinus/25' },
  mahasiswa: { label: 'Mahasiswa', kelas: 'bg-oker-2 text-oker border-oker/30' }
};
