<script>
  import { page } from '$app/state';
  import { api, sesi, unduh, konfigurasi } from '$lib/api.js';
  import { tanggal, ukuran, sisaWaktu, STATUS } from '$lib/format.js';
  import Cangkang from '$lib/Cangkang.svelte';
  import Modal from '$lib/Modal.svelte';
  import Peringatan from '$lib/Peringatan.svelte';
  import Kosong from '$lib/Kosong.svelte';

  let id = $derived(page.params.id);
  let user = $state(sesi.user());
  let pengelola = $derived(user?.peran === 'dosen' || user?.peran === 'administrator');

  let mk = $state(null);
  let materi = $state([]);
  let tugas = $state([]);
  let memuat = $state(true);
  let tab = $state('materi');
  let galat = $state('');
  let sukses = $state('');

  let modalMateri = $state(false);
  let modalTugas = $state(false);
  let memproses = $state(false);

  // Batas unggah dibaca dari back-end, bukan disalin di sini, agar keterangan
  // pada form tidak pernah berbeda dari aturan yang benar-benar diterapkan.
  let batas = $state(null);
  let berkasMateri = $state(null);
  let rekap = $state(null);
  let formMateri = $state({ judul: '', deskripsi: '' });

  // Tab rekapitulasi nilai hanya untuk pengelola (KF-12 sisi dosen);
  // mahasiswa melihat rekap miliknya sendiri di halaman /nilai.
  let tabTersedia = $derived(
    [
      ['materi', `Materi (${materi.length})`],
      ['tugas', `Tugas (${tugas.length})`],
      ...(pengelola ? [['rekap', 'Rekap Nilai']] : [])
    ]
  );
  let formTugas = $state({ judul: '', deskripsi: '', batas_waktu: '', nilai_maksimum: 100 });

  $effect(() => {
    if (id) muat(id);
  });

  $effect(() => {
    konfigurasi().then((k) => (batas = k.materi)).catch(() => {});
  });

  // Rekap diambil hanya ketika tabnya dibuka: query-nya menjangkau seluruh
  // tugas dan mahasiswa, sehingga tidak perlu ikut termuat setiap buka halaman.
  $effect(() => {
    if (tab === 'rekap' && id) {
      api
        .rekapNilai(id)
        .then((r) => (rekap = r.data))
        .catch((err) => (galat = err.message));
    }
  });

  async function muat(mkId) {
    memuat = true;
    try {
      const [a, b, c] = await Promise.all([
        api.detailMataKuliah(mkId),
        api.daftarMateri(mkId),
        api.daftarTugas(mkId)
      ]);
      mk = a.data;
      materi = b.data ?? [];
      tugas = c.data ?? [];
    } catch (err) {
      galat = err.message;
    } finally {
      memuat = false;
    }
  }

  function beritahu(pesan) {
    sukses = pesan;
    setTimeout(() => (sukses = ''), 4000);
  }

  async function unggahMateri(e) {
    e.preventDefault();
    galat = '';
    if (!berkasMateri?.[0]) {
      galat = 'Berkas materi wajib dipilih';
      return;
    }
    memproses = true;
    try {
      // FormData dipakai langsung agar berkas terkirim sebagai multipart,
      // bukan JSON — sesuai endpoint unggah materi di back-end.
      const fd = new FormData();
      fd.append('judul', formMateri.judul);
      fd.append('deskripsi', formMateri.deskripsi);
      fd.append('berkas', berkasMateri[0]);
      await api.unggahMateri(id, fd);
      modalMateri = false;
      formMateri = { judul: '', deskripsi: '' };
      berkasMateri = null;
      await muat(id);
      beritahu('Materi berhasil diunggah');
    } catch (err) {
      galat = err.message;
    } finally {
      memproses = false;
    }
  }

  async function buatTugas(e) {
    e.preventDefault();
    galat = '';
    memproses = true;
    try {
      await api.buatTugas(id, {
        ...formTugas,
        nilai_maksimum: Number(formTugas.nilai_maksimum),
        batas_waktu: new Date(formTugas.batas_waktu).toISOString()
      });
      modalTugas = false;
      formTugas = { judul: '', deskripsi: '', batas_waktu: '', nilai_maksimum: 100 };
      await muat(id);
      beritahu('Tugas berhasil dibuat');
    } catch (err) {
      galat = err.message;
    } finally {
      memproses = false;
    }
  }

  async function hapusMateri(m) {
    if (!confirm(`Hapus materi "${m.judul}"?`)) return;
    try {
      await api.hapusMateri(m.id);
      await muat(id);
      beritahu('Materi dihapus');
    } catch (err) {
      galat = err.message;
    }
  }

  async function hapusTugas(t) {
    if (!confirm(`Hapus tugas "${t.judul}"? Seluruh pengumpulan mahasiswa ikut terhapus.`)) return;
    try {
      await api.hapusTugas(t.id);
      await muat(id);
      beritahu('Tugas dihapus');
    } catch (err) {
      galat = err.message;
    }
  }
</script>

<Cangkang judul={mk?.nama ?? 'Mata Kuliah'} keterangan={mk ? `${mk.kode} · ${mk.sks} SKS · Semester ${mk.semester}${mk.dosen ? ` · ${mk.dosen.nama}` : ''}` : ''}>
  {#snippet aksi()}
    {#if pengelola}
      {#if tab === 'materi'}
        <button onclick={() => { galat = ''; modalMateri = true; }} class="tombol-utama">+ Unggah Materi</button>
      {:else if tab === 'tugas'}
        <button onclick={() => { galat = ''; modalTugas = true; }} class="tombol-utama">+ Buat Tugas</button>
      {/if}
    {/if}
  {/snippet}

  <div class="space-y-5">
    {#if sukses}<Peringatan pesan={sukses} jenis="berhasil" />{/if}
    {#if galat && !modalMateri && !modalTugas}<Peringatan pesan={galat} />{/if}

    <div class="flex gap-1 border-b border-garis">
      {#each tabTersedia as [nilai, label]}
        <button
          onclick={() => (tab = nilai)}
          class="-mb-px border-b-2 px-5 py-2.5 text-[14px] font-semibold transition-colors
                 {tab === nilai ? 'border-pinus text-pinus' : 'border-transparent text-tinta-3 hover:text-tinta'}"
        >{label}</button>
      {/each}
    </div>

    {#if memuat}
      <div class="py-16 text-center text-[14px] text-tinta-3">Memuat…</div>
    {:else if tab === 'materi'}
      <!-- Gambar 4.10 — Kelola Materi Pembelajaran -->
      {#if materi.length === 0}
        <Kosong
          pesan="Belum ada materi"
          saran={pengelola ? 'Unggah materi pertama melalui tombol di kanan atas.' : 'Dosen belum mengunggah materi.'}
        />
      {:else}
        <div class="kartu divide-y divide-garis/60">
          {#each materi as m (m.id)}
            <div class="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <div class="min-w-0 flex-1">
                <div class="text-[15.5px] font-semibold">{m.judul}</div>
                {#if m.deskripsi}
                  <p class="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-tinta-2">{m.deskripsi}</p>
                {/if}
                <div class="mt-2 flex flex-wrap gap-x-4 text-[12.5px] text-tinta-3">
                  <span>{ukuran(m.ukuran_berkas)}</span>
                  <span>Diunggah {tanggal(m.diunggah_pada)}</span>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button onclick={() => unduh(`/materi/${m.id}/unduh`, m.judul)} class="tombol-garis !py-2 !text-[13px]">
                  Unduh
                </button>
                {#if pengelola}
                  <button onclick={() => hapusMateri(m)} class="tombol-bahaya !py-2 !text-[13px]">Hapus</button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:else if tab === 'rekap'}
      <!-- KF-12 — rekapitulasi nilai seluruh mahasiswa pada mata kuliah ini -->
      {#if !rekap}
        <div class="py-16 text-center text-[14px] text-tinta-3">Memuat rekap…</div>
      {:else if rekap.tugas.length === 0}
        <Kosong pesan="Belum ada tugas" saran="Rekap nilai tersedia setelah tugas dibuat." />
      {:else}
        <div class="kartu overflow-x-auto">
          <table class="w-full text-[14px]">
            <thead class="border-b border-garis bg-kertas-2">
              <tr class="text-left text-[11px] font-semibold tracking-[0.1em] text-tinta-3 uppercase">
                <th class="px-5 py-3.5">Mahasiswa</th>
                {#each rekap.tugas as t (t.id)}
                  <th class="px-4 py-3.5 text-center whitespace-nowrap" title={t.judul}>
                    {t.judul.length > 18 ? t.judul.slice(0, 18) + '…' : t.judul}
                    <div class="mt-0.5 font-normal normal-case">maks {t.nilai_maksimum}</div>
                  </th>
                {/each}
                <th class="px-5 py-3.5 text-right">Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {#each rekap.rekap as r (r.mahasiswa.id)}
                <tr class="border-b border-garis/60 transition-colors last:border-0 hover:bg-kertas-2/60">
                  <td class="px-5 py-3.5 whitespace-nowrap">
                    <div class="font-medium">{r.mahasiswa.nama}</div>
                    <div class="font-mono text-[12px] text-tinta-3">{r.mahasiswa.nomor_induk || '—'}</div>
                  </td>
                  {#each r.daftar as b (b.tugas.id)}
                    <td class="px-4 py-3.5 text-center">
                      {#if b.nilai !== null}
                        <span class="font-semibold text-pinus">{b.nilai}</span>
                      {:else}
                        <span class="text-[12px] text-tinta-3">{STATUS[b.status].label}</span>
                      {/if}
                    </td>
                  {/each}
                  <td class="px-5 py-3.5 text-right">
                    {#if r.rata_rata !== null}
                      <span class="font-serif text-[18px] font-semibold text-pinus">{r.rata_rata.toFixed(1)}</span>
                    {:else}
                      <span class="text-tinta-3">—</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {:else}
      {#if tugas.length === 0}
        <Kosong
          pesan="Belum ada tugas"
          saran={pengelola ? 'Buat tugas pertama melalui tombol di kanan atas.' : 'Dosen belum membuat tugas.'}
        />
      {:else}
        <div class="kartu divide-y divide-garis/60">
          {#each tugas as t (t.id)}
            {@const sisa = sisaWaktu(t.batas_waktu)}
            <div class="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <div class="min-w-0 flex-1">
                <a href="/tugas/{t.id}" class="text-[15.5px] font-semibold hover:text-pinus hover:underline">
                  {t.judul}
                </a>
                {#if t.deskripsi}
                  <p class="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-tinta-2">{t.deskripsi}</p>
                {/if}
                <div class="mt-2 flex flex-wrap gap-x-4 text-[12.5px] text-tinta-3">
                  <span>Batas waktu {tanggal(t.batas_waktu)}</span>
                  <span>Nilai maksimum {t.nilai_maksimum}</span>
                  <span class="font-semibold {sisa.lewat ? 'text-bata' : sisa.mendesak ? 'text-oker' : 'text-pinus'}">
                    {sisa.teks}
                  </span>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <a href="/tugas/{t.id}" class="tombol-garis !py-2 !text-[13px]">
                  {pengelola ? 'Lihat Pengumpulan' : 'Buka Tugas'}
                </a>
                {#if pengelola}
                  <button onclick={() => hapusTugas(t)} class="tombol-bahaya !py-2 !text-[13px]">Hapus</button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</Cangkang>

<Modal bind:terbuka={modalMateri} judul="Unggah Materi Pembelajaran">
  <form onsubmit={unggahMateri} class="space-y-4">
    {#if galat}<Peringatan pesan={galat} />{/if}
    <div>
      <label class="label-bidang" for="jm">Judul Materi</label>
      <input id="jm" bind:value={formMateri.judul} required maxlength="150" class="bidang" />
    </div>
    <div>
      <label class="label-bidang" for="dm">Deskripsi</label>
      <textarea id="dm" bind:value={formMateri.deskripsi} rows="3" class="bidang resize-none"></textarea>
    </div>
    <div>
      <label class="label-bidang" for="bm">Berkas</label>
      <input
        id="bm"
        type="file"
        bind:files={berkasMateri}
        required
        accept={batas?.ekstensi.join(',')}
        class="bidang !py-2"
      />
      {#if batas}
        <p class="mt-1.5 text-[12px] text-tinta-3">
          Format {batas.ekstensi.join(', ')}. Maksimal {batas.maks_mb} MB.
        </p>
      {/if}
    </div>
    <div class="flex justify-end gap-3 border-t border-garis pt-5">
      <button type="button" onclick={() => (modalMateri = false)} class="tombol-garis">Batal</button>
      <button type="submit" disabled={memproses} class="tombol-utama">{memproses ? 'Mengunggah…' : 'Unggah'}</button>
    </div>
  </form>
</Modal>

<!-- Gambar 4.11 — Form Pembuatan Tugas -->
<Modal bind:terbuka={modalTugas} judul="Buat Tugas Baru">
  <form onsubmit={buatTugas} class="space-y-4">
    {#if galat}<Peringatan pesan={galat} />{/if}
    <div>
      <label class="label-bidang" for="jt">Judul Tugas</label>
      <input id="jt" bind:value={formTugas.judul} required maxlength="150" class="bidang" />
    </div>
    <div>
      <label class="label-bidang" for="dt">Deskripsi / Instruksi</label>
      <textarea id="dt" bind:value={formTugas.deskripsi} rows="4" class="bidang resize-none"></textarea>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="label-bidang" for="bw">Batas Waktu</label>
        <input id="bw" type="datetime-local" bind:value={formTugas.batas_waktu} required class="bidang" />
      </div>
      <div>
        <label class="label-bidang" for="nm">Nilai Maksimum</label>
        <input id="nm" type="number" bind:value={formTugas.nilai_maksimum} required min="1" max="1000" class="bidang" />
      </div>
    </div>
    <div class="flex justify-end gap-3 border-t border-garis pt-5">
      <button type="button" onclick={() => (modalTugas = false)} class="tombol-garis">Batal</button>
      <button type="submit" disabled={memproses} class="tombol-utama">{memproses ? 'Menyimpan…' : 'Simpan Tugas'}</button>
    </div>
  </form>
</Modal>
