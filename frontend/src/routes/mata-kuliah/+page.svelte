<script>
  import { api, sesi } from '$lib/api.js';
  import Cangkang from '$lib/Cangkang.svelte';
  import Modal from '$lib/Modal.svelte';
  import Peringatan from '$lib/Peringatan.svelte';
  import Kosong from '$lib/Kosong.svelte';

  let user = $state(sesi.user());
  let admin = $derived(user?.peran === 'administrator');

  let daftar = $state([]);
  let dosen = $state([]);
  let memuat = $state(true);

  let terbuka = $state(false);
  let sedangUbah = $state(null);
  let galat = $state('');
  let sukses = $state('');
  let memproses = $state(false);

  const kosong = { kode: '', nama: '', sks: 2, semester: 1, dosen_id: null };
  let form = $state({ ...kosong });

  $effect(() => {
    muat();
  });

  async function muat() {
    memuat = true;
    try {
      daftar = (await api.daftarMataKuliah()).data ?? [];
      if (sesi.user()?.peran === 'administrator') {
        dosen = (await api.daftarPengguna('dosen')).data ?? [];
      }
    } finally {
      memuat = false;
    }
  }

  function bukaTambah() {
    sedangUbah = null;
    form = { ...kosong };
    galat = '';
    terbuka = true;
  }

  function bukaUbah(mk) {
    sedangUbah = mk;
    form = { kode: mk.kode, nama: mk.nama, sks: mk.sks, semester: mk.semester, dosen_id: mk.dosen_id ?? null };
    galat = '';
    terbuka = true;
  }

  async function simpan(e) {
    e.preventDefault();
    galat = '';
    memproses = true;
    try {
      const data = { ...form, sks: Number(form.sks), semester: Number(form.semester), dosen_id: form.dosen_id || null };
      if (sedangUbah) {
        await api.ubahMataKuliah(sedangUbah.id, data);
        sukses = `Mata kuliah ${data.kode} diperbarui`;
      } else {
        await api.buatMataKuliah(data);
        sukses = `Mata kuliah ${data.kode} ditambahkan`;
      }
      terbuka = false;
      await muat();
      setTimeout(() => (sukses = ''), 4000);
    } catch (err) {
      galat = err.message;
    } finally {
      memproses = false;
    }
  }

  async function hapus(mk) {
    if (!confirm(`Hapus mata kuliah "${mk.nama}"? Seluruh materi dan tugas di dalamnya ikut terhapus.`)) return;
    try {
      await api.hapusMataKuliah(mk.id);
      sukses = `Mata kuliah ${mk.kode} dihapus`;
      await muat();
      setTimeout(() => (sukses = ''), 4000);
    } catch (err) {
      galat = err.message;
    }
  }
</script>

<Cangkang
  judul={admin ? 'Data Mata Kuliah' : user?.peran === 'dosen' ? 'Mata Kuliah Diampu' : 'Mata Kuliah'}
  keterangan={admin
    ? 'Mengelola data mata kuliah beserta penetapan dosen pengampu.'
    : 'Pilih mata kuliah untuk melihat materi dan tugas.'}
>
  {#snippet aksi()}
    {#if admin}
      <button onclick={bukaTambah} class="tombol-utama">+ Tambah Mata Kuliah</button>
    {/if}
  {/snippet}

  <div class="space-y-4">
    {#if sukses}<Peringatan pesan={sukses} jenis="berhasil" />{/if}
    {#if galat}<Peringatan pesan={galat} />{/if}

    {#if memuat}
      <div class="py-16 text-center text-[14px] text-tinta-3">Memuat…</div>
    {:else if daftar.length === 0}
      <Kosong
        pesan="Belum ada mata kuliah"
        saran={admin ? 'Tambahkan mata kuliah melalui tombol di kanan atas.' : 'Hubungi administrator.'}
      />
    {:else if admin}
      <!-- Gambar 4.8 — Kelola Data Mata Kuliah -->
      <div class="kartu overflow-x-auto">
        <table class="w-full text-[14px]">
          <thead class="border-b border-garis bg-kertas-2">
            <tr class="text-left text-[11px] font-semibold tracking-[0.1em] text-tinta-3 uppercase">
              <th class="px-5 py-3.5">Kode</th>
              <th class="px-5 py-3.5">Nama Mata Kuliah</th>
              <th class="px-5 py-3.5">SKS</th>
              <th class="px-5 py-3.5">Semester</th>
              <th class="px-5 py-3.5">Dosen Pengampu</th>
              <th class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each daftar as mk (mk.id)}
              <tr class="border-b border-garis/60 transition-colors last:border-0 hover:bg-kertas-2/60">
                <td class="px-5 py-3.5 font-mono text-[13px] font-medium text-oker">{mk.kode}</td>
                <td class="px-5 py-3.5 font-medium">
                  <a href="/mata-kuliah/{mk.id}" class="hover:text-pinus hover:underline">{mk.nama}</a>
                </td>
                <td class="px-5 py-3.5 text-tinta-2">{mk.sks}</td>
                <td class="px-5 py-3.5 text-tinta-2">{mk.semester}</td>
                <td class="px-5 py-3.5 {mk.dosen ? 'text-tinta-2' : 'text-tinta-3 italic'}">
                  {mk.dosen?.nama ?? 'Belum ditetapkan'}
                </td>
                <td class="px-5 py-3.5 text-right whitespace-nowrap">
                  <button onclick={() => bukaUbah(mk)} class="text-[13px] font-semibold text-pinus hover:underline">Ubah</button>
                  <button onclick={() => hapus(mk)} class="ml-3 text-[13px] font-semibold text-bata hover:underline">Hapus</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {#each daftar as mk (mk.id)}
          <a href="/mata-kuliah/{mk.id}" class="kartu group flex flex-col p-5 transition-colors hover:border-pinus">
            <div class="font-mono text-[12px] font-medium text-oker">{mk.kode}</div>
            <div class="mt-2 flex-1 font-serif text-[20px] leading-snug font-semibold group-hover:text-pinus">
              {mk.nama}
            </div>
            <div class="mt-4 flex items-center justify-between border-t border-garis pt-3.5 text-[12.5px] text-tinta-3">
              <span>{mk.sks} SKS &middot; Semester {mk.semester}</span>
              <span class="font-semibold text-pinus opacity-0 transition-opacity group-hover:opacity-100">Buka &rarr;</span>
            </div>
            {#if mk.dosen}
              <div class="mt-1.5 text-[12.5px] text-tinta-2">{mk.dosen.nama}</div>
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</Cangkang>

<Modal bind:terbuka judul={sedangUbah ? 'Ubah Mata Kuliah' : 'Tambah Mata Kuliah'}>
  <form onsubmit={simpan} class="space-y-4">
    {#if galat}<Peringatan pesan={galat} />{/if}

    <div class="grid gap-4 sm:grid-cols-[150px_1fr]">
      <div>
        <label class="label-bidang" for="kode">Kode</label>
        <input id="kode" bind:value={form.kode} required maxlength="10" placeholder="SI-401" class="bidang font-mono" />
      </div>
      <div>
        <label class="label-bidang" for="namamk">Nama Mata Kuliah</label>
        <input id="namamk" bind:value={form.nama} required maxlength="100" class="bidang" />
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="label-bidang" for="sks">Jumlah SKS</label>
        <input id="sks" type="number" bind:value={form.sks} required min="1" max="24" class="bidang" />
      </div>
      <div>
        <label class="label-bidang" for="sem">Semester</label>
        <input id="sem" type="number" bind:value={form.semester} min="1" max="14" class="bidang" />
      </div>
    </div>

    <div>
      <label class="label-bidang" for="pengampu">Dosen Pengampu</label>
      <select id="pengampu" bind:value={form.dosen_id} class="bidang">
        <option value={null}>— Belum ditetapkan —</option>
        {#each dosen as d (d.id)}
          <option value={d.id}>{d.nama}{d.nomor_induk ? ` (${d.nomor_induk})` : ''}</option>
        {/each}
      </select>
    </div>

    <div class="flex justify-end gap-3 border-t border-garis pt-5">
      <button type="button" onclick={() => (terbuka = false)} class="tombol-garis">Batal</button>
      <button type="submit" disabled={memproses} class="tombol-utama">
        {memproses ? 'Menyimpan…' : 'Simpan'}
      </button>
    </div>
  </form>
</Modal>
