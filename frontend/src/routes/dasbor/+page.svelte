<script>
  import { api, sesi } from '$lib/api.js';
  import { tanggal, sisaWaktu, STATUS } from '$lib/format.js';
  import Cangkang from '$lib/Cangkang.svelte';
  import Statistik from '$lib/Statistik.svelte';
  import Lencana from '$lib/Lencana.svelte';
  import Kosong from '$lib/Kosong.svelte';

  let user = $state(sesi.user());
  let peran = $derived(user?.peran);

  let mataKuliah = $state([]);
  let pengguna = $state([]);
  let rekap = $state([]);
  let jumlahMateri = $state(0);
  let tugasAktif = $state(0);
  let belumDinilai = $state(0);
  let memuat = $state(true);

  const SAPAAN = {
    administrator: 'Ringkasan data induk sistem dan aktivitas pengguna.',
    dosen: 'Ringkasan mata kuliah yang Anda ampu dan pekerjaan yang menunggu penilaian.',
    mahasiswa: 'Ringkasan perkuliahan, tugas yang menunggu, dan capaian nilai Anda.'
  };

  // Statistik mahasiswa seluruhnya diturunkan dari satu panggilan rekap nilai,
  // sehingga dasbor tidak perlu memanggil endpoint tambahan.
  let totalTugas = $derived(rekap.reduce((n, r) => n + r.jumlah_tugas, 0));
  let belumKumpul = $derived(
    rekap.reduce((n, r) => n + r.daftar.filter((b) => b.status === 'belum').length, 0)
  );
  let nilaiDinilai = $derived(rekap.flatMap((r) => r.daftar).filter((b) => b.nilai !== null));
  let rataRata = $derived(
    nilaiDinilai.length
      ? (nilaiDinilai.reduce((n, b) => n + b.nilai, 0) / nilaiDinilai.length).toFixed(1)
      : '—'
  );
  let tenggatTerdekat = $derived(
    rekap
      .flatMap((r) => r.daftar.map((b) => ({ ...b, mk: r.mata_kuliah })))
      .filter((b) => b.status === 'belum' && new Date(b.tugas.batas_waktu) > new Date())
      .sort((a, b) => new Date(a.tugas.batas_waktu) - new Date(b.tugas.batas_waktu))
      .slice(0, 5)
  );

  // Sengaja TIDAK menulis ke `user` di sini: menulis lalu membaca state yang
  // sama di dalam satu $effect membuat efek memicu dirinya sendiri tanpa henti.
  $effect(() => {
    const u = sesi.user();
    if (u) muat(u.peran);
  });

  async function muat(p) {
    memuat = true;
    try {
      if (p === 'administrator') {
        const [rp, rmk] = await Promise.all([api.daftarPengguna(), api.daftarMataKuliah()]);
        pengguna = rp.data ?? [];
        mataKuliah = rmk.data ?? [];
        const semua = await Promise.all(mataKuliah.map((mk) => api.daftarMateri(mk.id)));
        jumlahMateri = semua.reduce((n, r) => n + (r.data?.length ?? 0), 0);
      } else if (p === 'dosen') {
        const rmk = await api.daftarMataKuliah();
        mataKuliah = rmk.data ?? [];
        const perMK = await Promise.all(mataKuliah.map((mk) => api.daftarTugas(mk.id)));
        const tugas = perMK.flatMap((r) => r.data ?? []);
        tugasAktif = tugas.filter((t) => new Date(t.batas_waktu) > new Date()).length;

        const kumpul = await Promise.all(tugas.map((t) => api.daftarPengumpulan(t.id)));
        belumDinilai = kumpul.reduce(
          (n, r) =>
            n + (r.data?.daftar ?? []).filter((b) => b.status === 'terkumpul' || b.status === 'terlambat').length,
          0
        );
      } else {
        const [rmk, rn] = await Promise.all([api.daftarMataKuliah(), api.nilaiSaya()]);
        mataKuliah = rmk.data ?? [];
        rekap = rn.data ?? [];
      }
    } catch {
      /* galat sudah ditangani pembungkus API */
    } finally {
      memuat = false;
    }
  }
</script>

<Cangkang judul="Dasbor" keterangan={SAPAAN[peran] ?? ''}>
  {#if memuat}
    <div class="py-16 text-center text-[14px] text-tinta-3">Memuat ringkasan…</div>
  {:else if peran === 'administrator'}
    <!-- Gambar 4.6 — Dasbor Administrator -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Statistik
        angka={pengguna.filter((u) => u.peran === 'mahasiswa').length}
        label="Mahasiswa"
        keterangan="Akun terdaftar"
      />
      <Statistik
        angka={pengguna.filter((u) => u.peran === 'dosen').length}
        label="Dosen"
        keterangan="Akun terdaftar"
      />
      <Statistik angka={mataKuliah.length} label="Mata Kuliah" keterangan="Total ditawarkan" />
      <Statistik angka={jumlahMateri} label="Materi" keterangan="Berkas terunggah" aksen />
    </div>

    <section class="mt-9">
      <h2 class="mb-4 font-serif text-[19px] font-semibold">Pengguna Terbaru</h2>
      {#if pengguna.length === 0}
        <Kosong pesan="Belum ada pengguna" saran="Tambahkan melalui menu Data Pengguna." />
      {:else}
        <div class="kartu overflow-x-auto">
          <table class="w-full text-[14px]">
            <thead class="border-b border-garis bg-kertas-2">
              <tr class="text-left text-[11px] font-semibold tracking-[0.1em] text-tinta-3 uppercase">
                <th class="px-5 py-3.5">Nama</th>
                <th class="px-5 py-3.5">Surel</th>
                <th class="px-5 py-3.5">Peran</th>
                <th class="px-5 py-3.5">Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {#each pengguna.slice(0, 6) as u (u.id)}
                <tr class="border-b border-garis/60 last:border-0">
                  <td class="px-5 py-3.5 font-medium">{u.nama}</td>
                  <td class="px-5 py-3.5 text-tinta-2">{u.email}</td>
                  <td class="px-5 py-3.5">
                    <span class="font-mono text-[12px] text-tinta-2">{u.peran}</span>
                  </td>
                  <td class="px-5 py-3.5 text-tinta-3">{tanggal(u.dibuat_pada, false)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  {:else if peran === 'dosen'}
    <!-- Gambar 4.9 — Dasbor Dosen -->
    <div class="grid gap-4 sm:grid-cols-3">
      <Statistik angka={mataKuliah.length} label="Mata Kuliah Diampu" />
      <Statistik angka={tugasAktif} label="Tugas Aktif" keterangan="Belum lewat batas waktu" />
      <Statistik angka={belumDinilai} label="Menunggu Dinilai" keterangan="Pengumpulan masuk" aksen />
    </div>

    <section class="mt-9">
      <h2 class="mb-4 font-serif text-[19px] font-semibold">Mata Kuliah yang Diampu</h2>
      {#if mataKuliah.length === 0}
        <Kosong pesan="Belum ada mata kuliah" saran="Administrator belum menetapkan Anda sebagai pengampu." />
      {:else}
        <div class="grid gap-4 md:grid-cols-2">
          {#each mataKuliah as mk (mk.id)}
            <a href="/mata-kuliah/{mk.id}" class="kartu group p-5 transition-colors hover:border-pinus">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-mono text-[12px] font-medium text-oker">{mk.kode}</div>
                  <div class="mt-1.5 font-serif text-[19px] font-semibold group-hover:text-pinus">
                    {mk.nama}
                  </div>
                </div>
                <div class="shrink-0 text-right text-[12px] text-tinta-3">
                  {mk.sks} SKS<br />Sem. {mk.semester}
                </div>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </section>
  {:else}
    <!-- Gambar 4.13 — Dasbor Mahasiswa -->
    <div class="grid gap-4 sm:grid-cols-3">
      <Statistik angka={mataKuliah.length} label="Mata Kuliah" />
      <Statistik angka={belumKumpul} label="Belum Dikumpulkan" keterangan="dari {totalTugas} tugas" />
      <Statistik angka={rataRata} label="Rata-rata Nilai" keterangan="Tugas yang sudah dinilai" aksen />
    </div>

    <section class="mt-9">
      <h2 class="mb-4 font-serif text-[19px] font-semibold">Tugas dengan Batas Waktu Terdekat</h2>
      {#if tenggatTerdekat.length === 0}
        <Kosong pesan="Tidak ada tugas yang menunggu" saran="Semua tugas aktif sudah Anda kumpulkan." />
      {:else}
        <div class="kartu divide-y divide-garis/60">
          {#each tenggatTerdekat as b (b.tugas.id)}
            {@const sisa = sisaWaktu(b.tugas.batas_waktu)}
            <a
              href="/tugas/{b.tugas.id}"
              class="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-kertas-2"
            >
              <div class="min-w-0">
                <div class="font-mono text-[11.5px] text-oker">{b.mk.kode}</div>
                <div class="mt-1 text-[15px] font-semibold">{b.tugas.judul}</div>
                <div class="mt-1 text-[13px] text-tinta-3">
                  Batas waktu {tanggal(b.tugas.batas_waktu)}
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-3">
                <span
                  class="text-[13px] font-semibold {sisa.mendesak ? 'text-bata' : 'text-tinta-2'}"
                >{sisa.teks}</span>
                <Lencana label={STATUS[b.status].label} kelas={STATUS[b.status].kelas} />
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</Cangkang>
