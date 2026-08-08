<script>
  import { page } from '$app/state';
  import { api, sesi, unduh, konfigurasi } from '$lib/api.js';
  import { tanggal, sisaWaktu, STATUS } from '$lib/format.js';
  import Cangkang from '$lib/Cangkang.svelte';
  import Lencana from '$lib/Lencana.svelte';
  import Modal from '$lib/Modal.svelte';
  import Peringatan from '$lib/Peringatan.svelte';
  import Kosong from '$lib/Kosong.svelte';

  let id = $derived(page.params.id);
  let user = $state(sesi.user());
  let mahasiswa = $derived(user?.peran === 'mahasiswa');

  let tugas = $state(null);
  let baris = $state([]);
  let punyaSaya = $state(null);
  let statusSaya = $state('belum');
  let memuat = $state(true);
  let galat = $state('');
  let sukses = $state('');
  let memproses = $state(false);

  // Batas unggah dibaca dari back-end agar tidak pernah berbeda dari aturan
  // yang benar-benar diterapkan saat pengumpulan diproses.
  let batas = $state(null);
  let berkasJawaban = $state(null);
  let modalNilai = $state(false);
  let sedangDinilai = $state(null);
  let formNilai = $state({ nilai: 0, umpan_balik: '' });

  let sisa = $derived(tugas ? sisaWaktu(tugas.batas_waktu) : null);
  let sudahDinilai = $derived(baris.filter((b) => b.status === 'dinilai').length);
  let sudahKumpul = $derived(baris.filter((b) => b.status !== 'belum').length);

  $effect(() => {
    if (id) muat(id);
  });

  $effect(() => {
    konfigurasi().then((k) => (batas = k.pengumpulan)).catch(() => {});
  });

  async function muat(tugasId) {
    memuat = true;
    try {
      if (sesi.user()?.peran === 'mahasiswa') {
        const r = await api.pengumpulanSaya(tugasId);
        tugas = r.data.tugas;
        punyaSaya = r.data.pengumpulan;
        statusSaya = r.data.status;
      } else {
        const r = await api.daftarPengumpulan(tugasId);
        tugas = r.data.tugas;
        baris = r.data.daftar ?? [];
      }
    } catch (err) {
      galat = err.message;
    } finally {
      memuat = false;
    }
  }

  function beritahu(pesan) {
    sukses = pesan;
    setTimeout(() => (sukses = ''), 5000);
  }

  async function kumpulkan(e) {
    e.preventDefault();
    galat = '';
    if (!berkasJawaban?.[0]) {
      galat = 'Berkas jawaban wajib dipilih';
      return;
    }
    memproses = true;
    try {
      const fd = new FormData();
      fd.append('berkas', berkasJawaban[0]);
      const r = await api.kumpulkan(id, fd);
      berkasJawaban = null;
      await muat(id);
      beritahu(r.message);
    } catch (err) {
      galat = err.message;
    } finally {
      memproses = false;
    }
  }

  function bukaNilai(b) {
    sedangDinilai = b;
    formNilai = { nilai: b.pengumpulan?.nilai ?? 0, umpan_balik: b.pengumpulan?.umpan_balik ?? '' };
    galat = '';
    modalNilai = true;
  }

  async function simpanNilai(e) {
    e.preventDefault();
    galat = '';
    memproses = true;
    try {
      await api.beriNilai(sedangDinilai.pengumpulan.id, {
        nilai: Number(formNilai.nilai),
        umpan_balik: formNilai.umpan_balik
      });
      modalNilai = false;
      await muat(id);
      beritahu(`Nilai untuk ${sedangDinilai.mahasiswa.nama} tersimpan`);
    } catch (err) {
      galat = err.message;
    } finally {
      memproses = false;
    }
  }
</script>

<Cangkang
  judul={tugas?.judul ?? 'Tugas'}
  keterangan={tugas?.mata_kuliah ? `${tugas.mata_kuliah.kode} · ${tugas.mata_kuliah.nama}` : ''}
>
  <div class="space-y-5">
    {#if sukses}<Peringatan pesan={sukses} jenis="berhasil" />{/if}
    {#if galat && !modalNilai}<Peringatan pesan={galat} />{/if}

    {#if memuat}
      <div class="py-16 text-center text-[14px] text-tinta-3">Memuat…</div>
    {:else if tugas}
      <!-- Detail instruksi tugas -->
      <div class="kartu p-6">
        <div class="grid gap-6 md:grid-cols-[1fr_auto]">
          <div class="min-w-0">
            <div class="label-bidang">Instruksi Pengerjaan</div>
            <p class="text-[14.5px] leading-relaxed whitespace-pre-line text-tinta-2">
              {tugas.deskripsi || 'Tidak ada instruksi tambahan.'}
            </p>
          </div>
          <div class="flex shrink-0 gap-8 border-t border-garis pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-8">
            <div>
              <div class="label-bidang">Batas Waktu</div>
              <div class="text-[14px] font-semibold">{tanggal(tugas.batas_waktu)}</div>
              <div class="mt-1 text-[13px] font-semibold {sisa.lewat ? 'text-bata' : sisa.mendesak ? 'text-oker' : 'text-pinus'}">
                {sisa.teks}
              </div>
            </div>
            <div>
              <div class="label-bidang">Nilai Maksimum</div>
              <div class="font-serif text-[30px] leading-none font-semibold text-pinus">
                {tugas.nilai_maksimum}
              </div>
            </div>
          </div>
        </div>
      </div>

      {#if mahasiswa}
        <!-- Gambar 4.14 — Tampilan Pengumpulan Tugas -->
        <div class="kartu p-6">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-serif text-[20px] font-semibold">Pengumpulan Anda</h2>
            <Lencana label={STATUS[statusSaya].label} kelas={STATUS[statusSaya].kelas} />
          </div>

          {#if punyaSaya}
            <div class="mb-6 grid gap-4 border border-garis bg-kertas-2 p-5 sm:grid-cols-3">
              <div>
                <div class="label-bidang">Waktu Pengumpulan</div>
                <div class="text-[14px] font-medium">{tanggal(punyaSaya.waktu_kumpul)}</div>
              </div>
              <div>
                <div class="label-bidang">Nilai</div>
                <div class="font-serif text-[24px] leading-none font-semibold {punyaSaya.nilai !== null ? 'text-pinus' : 'text-tinta-3'}">
                  {punyaSaya.nilai ?? 'Belum dinilai'}{punyaSaya.nilai !== null ? ` / ${tugas.nilai_maksimum}` : ''}
                </div>
              </div>
              <div class="flex items-end">
                <button onclick={() => unduh(`/pengumpulan/${punyaSaya.id}/unduh`)} class="tombol-garis !py-2 !text-[13px]">
                  Unduh Berkas Saya
                </button>
              </div>
            </div>

            {#if punyaSaya.umpan_balik}
              <div class="mb-6 border-l-2 border-oker bg-oker-2 px-5 py-4">
                <div class="label-bidang !mb-1.5">Umpan Balik Dosen</div>
                <p class="text-[14px] leading-relaxed text-tinta-2">{punyaSaya.umpan_balik}</p>
              </div>
            {/if}
          {/if}

          {#if statusSaya === 'dinilai'}
            <p class="text-[13.5px] text-tinta-3">
              Tugas sudah dinilai dosen sehingga berkas tidak dapat dikumpulkan ulang.
            </p>
          {:else}
            <form onsubmit={kumpulkan} class="space-y-4">
              <div>
                <label class="label-bidang" for="bj">
                  {punyaSaya ? 'Ganti Berkas Jawaban' : 'Berkas Jawaban'}
                </label>
                <input
                  id="bj"
                  type="file"
                  bind:files={berkasJawaban}
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
              {#if sisa.lewat}
                <p class="text-[13px] font-medium text-bata">
                  Batas waktu sudah terlewat. Pengumpulan tetap diterima dan akan ditandai
                  <strong>Terlambat</strong>.
                </p>
              {/if}
              <button type="submit" disabled={memproses} class="tombol-utama">
                {memproses ? 'Mengunggah…' : punyaSaya ? 'Kumpulkan Ulang' : 'Kumpulkan Tugas'}
              </button>
            </form>
          {/if}
        </div>
      {:else}
        <!-- Gambar 4.12 — Daftar Pengumpulan dan Penilaian Tugas -->
        <div class="flex flex-wrap items-center gap-x-8 gap-y-2 border border-garis bg-kertas-2 px-5 py-4 text-[13.5px]">
          <span><strong class="font-semibold">{baris.length}</strong> mahasiswa</span>
          <span><strong class="font-semibold">{sudahKumpul}</strong> mengumpulkan</span>
          <span><strong class="font-semibold">{sudahDinilai}</strong> sudah dinilai</span>
          <span class="text-oker"><strong class="font-semibold">{sudahKumpul - sudahDinilai}</strong> menunggu penilaian</span>
        </div>

        {#if baris.length === 0}
          <Kosong pesan="Belum ada mahasiswa terdaftar" />
        {:else}
          <div class="kartu overflow-x-auto">
            <table class="w-full text-[14px]">
              <thead class="border-b border-garis bg-kertas-2">
                <tr class="text-left text-[11px] font-semibold tracking-[0.1em] text-tinta-3 uppercase">
                  <th class="px-5 py-3.5">Mahasiswa</th>
                  <th class="px-5 py-3.5">Nomor Induk</th>
                  <th class="px-5 py-3.5">Waktu Kumpul</th>
                  <th class="px-5 py-3.5">Status</th>
                  <th class="px-5 py-3.5">Nilai</th>
                  <th class="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {#each baris as b (b.mahasiswa.id)}
                  <tr class="border-b border-garis/60 transition-colors last:border-0 hover:bg-kertas-2/60">
                    <td class="px-5 py-3.5 font-medium whitespace-nowrap">{b.mahasiswa.nama}</td>
                    <td class="px-5 py-3.5 font-mono text-[13px] text-tinta-2">{b.mahasiswa.nomor_induk || '—'}</td>
                    <td class="px-5 py-3.5 whitespace-nowrap text-tinta-2">
                      {b.pengumpulan ? tanggal(b.pengumpulan.waktu_kumpul) : '—'}
                    </td>
                    <td class="px-5 py-3.5">
                      <Lencana label={STATUS[b.status].label} kelas={STATUS[b.status].kelas} />
                    </td>
                    <td class="px-5 py-3.5 font-semibold">
                      {#if b.pengumpulan?.nilai !== null && b.pengumpulan?.nilai !== undefined}
                        <span class="text-pinus">{b.pengumpulan.nilai}</span>
                        <span class="text-[12.5px] font-normal text-tinta-3">/ {tugas.nilai_maksimum}</span>
                      {:else}—{/if}
                    </td>
                    <td class="px-5 py-3.5 text-right whitespace-nowrap">
                      {#if b.pengumpulan}
                        <button onclick={() => unduh(`/pengumpulan/${b.pengumpulan.id}/unduh`)} class="text-[13px] font-semibold text-tinta-2 hover:underline">
                          Unduh
                        </button>
                        <button onclick={() => bukaNilai(b)} class="ml-3 text-[13px] font-semibold text-pinus hover:underline">
                          {b.status === 'dinilai' ? 'Ubah Nilai' : 'Beri Nilai'}
                        </button>
                      {:else}
                        <span class="text-[13px] text-tinta-3">Belum mengumpulkan</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</Cangkang>

<Modal bind:terbuka={modalNilai} judul="Beri Nilai dan Umpan Balik">
  {#if sedangDinilai}
    <form onsubmit={simpanNilai} class="space-y-4">
      {#if galat}<Peringatan pesan={galat} />{/if}

      <div class="border border-garis bg-kertas-2 px-4 py-3">
        <div class="text-[15px] font-semibold">{sedangDinilai.mahasiswa.nama}</div>
        <div class="mt-0.5 font-mono text-[12.5px] text-tinta-3">
          {sedangDinilai.mahasiswa.nomor_induk || '—'} &middot; dikumpulkan {tanggal(sedangDinilai.pengumpulan.waktu_kumpul)}
        </div>
      </div>

      <div>
        <label class="label-bidang" for="nilai">Nilai (0–{tugas.nilai_maksimum})</label>
        <input id="nilai" type="number" bind:value={formNilai.nilai} required min="0" max={tugas.nilai_maksimum} class="bidang" />
        <p class="mt-1.5 text-[12px] text-tinta-3">
          Nilai melebihi {tugas.nilai_maksimum} akan ditolak sistem.
        </p>
      </div>

      <div>
        <label class="label-bidang" for="ub">Umpan Balik</label>
        <textarea id="ub" bind:value={formNilai.umpan_balik} rows="4" placeholder="Catatan untuk mahasiswa…" class="bidang resize-none"></textarea>
      </div>

      <div class="flex justify-end gap-3 border-t border-garis pt-5">
        <button type="button" onclick={() => (modalNilai = false)} class="tombol-garis">Batal</button>
        <button type="submit" disabled={memproses} class="tombol-utama">
          {memproses ? 'Menyimpan…' : 'Simpan Nilai'}
        </button>
      </div>
    </form>
  {/if}
</Modal>
