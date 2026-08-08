<script>
  import { api } from '$lib/api.js';
  import { tanggal, PERAN } from '$lib/format.js';
  import Cangkang from '$lib/Cangkang.svelte';
  import Lencana from '$lib/Lencana.svelte';
  import Modal from '$lib/Modal.svelte';
  import Peringatan from '$lib/Peringatan.svelte';
  import Kosong from '$lib/Kosong.svelte';

  let daftar = $state([]);
  let memuat = $state(true);
  let saring = $state('');

  let terbuka = $state(false);
  let sedangUbah = $state(null);
  let galat = $state('');
  let sukses = $state('');
  let memproses = $state(false);

  const kosong = { nama: '', email: '', password: '', peran: 'mahasiswa', nomor_induk: '', status: 'aktif' };
  let form = $state({ ...kosong });

  let tersaring = $derived(saring ? daftar.filter((u) => u.peran === saring) : daftar);

  $effect(() => {
    muat();
  });

  async function muat() {
    memuat = true;
    try {
      daftar = (await api.daftarPengguna()).data ?? [];
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

  function bukaUbah(u) {
    sedangUbah = u;
    // Kata sandi sengaja dikosongkan: hanya dikirim bila diisi ulang.
    form = { nama: u.nama, email: u.email, password: '', peran: u.peran, nomor_induk: u.nomor_induk ?? '', status: u.status };
    galat = '';
    terbuka = true;
  }

  async function simpan(e) {
    e.preventDefault();
    galat = '';
    memproses = true;
    try {
      if (sedangUbah) {
        const data = { ...form };
        if (!data.password) delete data.password;
        await api.ubahPengguna(sedangUbah.id, data);
        sukses = `Data ${form.nama} berhasil diperbarui`;
      } else {
        await api.buatPengguna(form);
        sukses = `Pengguna ${form.nama} berhasil ditambahkan`;
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

  async function hapus(u) {
    if (!confirm(`Hapus pengguna "${u.nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.hapusPengguna(u.id);
      sukses = `Pengguna ${u.nama} dihapus`;
      await muat();
      setTimeout(() => (sukses = ''), 4000);
    } catch (err) {
      galat = err.message;
    }
  }
</script>

<Cangkang
  judul="Data Pengguna"
  keterangan="Menambah, mengubah, menghapus, dan menetapkan peran akun pengguna sistem."
>
  {#snippet aksi()}
    <button onclick={bukaTambah} class="tombol-utama">+ Tambah Pengguna</button>
  {/snippet}

  <div class="space-y-4">
    {#if sukses}<Peringatan pesan={sukses} jenis="berhasil" />{/if}
    {#if galat}<Peringatan pesan={galat} />{/if}

    <div class="flex flex-wrap items-center gap-2">
      {#each [['', 'Semua'], ['administrator', 'Administrator'], ['dosen', 'Dosen'], ['mahasiswa', 'Mahasiswa']] as [nilai, label]}
        <button
          onclick={() => (saring = nilai)}
          class="border px-3.5 py-1.5 text-[13px] font-medium transition-colors
                 {saring === nilai ? 'border-pinus bg-pinus text-kertas' : 'border-garis-2 bg-white text-tinta-2 hover:border-tinta'}"
        >{label}</button>
      {/each}
      <span class="ml-auto text-[13px] text-tinta-3">{tersaring.length} pengguna</span>
    </div>

    {#if memuat}
      <div class="py-16 text-center text-[14px] text-tinta-3">Memuat…</div>
    {:else if tersaring.length === 0}
      <Kosong pesan="Tidak ada pengguna" saran="Tambahkan pengguna baru melalui tombol di kanan atas." />
    {:else}
      <div class="kartu overflow-x-auto">
        <table class="w-full text-[14px]">
          <thead class="border-b border-garis bg-kertas-2">
            <tr class="text-left text-[11px] font-semibold tracking-[0.1em] text-tinta-3 uppercase">
              <th class="px-5 py-3.5">Nama</th>
              <th class="px-5 py-3.5">Surel</th>
              <th class="px-5 py-3.5">Nomor Induk</th>
              <th class="px-5 py-3.5">Peran</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5">Terdaftar</th>
              <th class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each tersaring as u (u.id)}
              <tr class="border-b border-garis/60 transition-colors last:border-0 hover:bg-kertas-2/60">
                <td class="px-5 py-3.5 font-medium whitespace-nowrap">{u.nama}</td>
                <td class="px-5 py-3.5 text-tinta-2">{u.email}</td>
                <td class="px-5 py-3.5 font-mono text-[13px] text-tinta-2">{u.nomor_induk || '—'}</td>
                <td class="px-5 py-3.5">
                  <Lencana label={PERAN[u.peran]?.label} kelas={PERAN[u.peran]?.kelas} />
                </td>
                <td class="px-5 py-3.5">
                  <span class="text-[13px] font-medium {u.status === 'aktif' ? 'text-pinus' : 'text-tinta-3'}">
                    {u.status}
                  </span>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap text-tinta-3">{tanggal(u.dibuat_pada, false)}</td>
                <td class="px-5 py-3.5 text-right whitespace-nowrap">
                  <button onclick={() => bukaUbah(u)} class="text-[13px] font-semibold text-pinus hover:underline">Ubah</button>
                  <button onclick={() => hapus(u)} class="ml-3 text-[13px] font-semibold text-bata hover:underline">Hapus</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</Cangkang>

<!-- Gambar 4.7 — Kelola Data Pengguna -->
<Modal bind:terbuka judul={sedangUbah ? 'Ubah Data Pengguna' : 'Tambah Pengguna'}>
  <form onsubmit={simpan} class="space-y-4">
    {#if galat}<Peringatan pesan={galat} />{/if}

    <div>
      <label class="label-bidang" for="nama">Nama Lengkap</label>
      <input id="nama" bind:value={form.nama} required minlength="3" maxlength="100" class="bidang" />
    </div>

    <div>
      <label class="label-bidang" for="surel">Surel</label>
      <input id="surel" type="email" bind:value={form.email} required maxlength="100" class="bidang" />
    </div>

    <div>
      <label class="label-bidang" for="sandi">
        Kata Sandi {sedangUbah ? '(kosongkan bila tidak diubah)' : ''}
      </label>
      <input
        id="sandi"
        type="password"
        bind:value={form.password}
        required={!sedangUbah}
        minlength="8"
        placeholder="Minimal 8 karakter"
        class="bidang"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="label-bidang" for="peran">Peran</label>
        <select id="peran" bind:value={form.peran} class="bidang">
          <option value="administrator">Administrator</option>
          <option value="dosen">Dosen</option>
          <option value="mahasiswa">Mahasiswa</option>
        </select>
      </div>
      <div>
        <label class="label-bidang" for="status">Status</label>
        <select id="status" bind:value={form.status} class="bidang">
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>
    </div>

    <div>
      <label class="label-bidang" for="induk">
        Nomor Induk <span class="normal-case">(NIM mahasiswa / NIDN dosen)</span>
      </label>
      <input id="induk" bind:value={form.nomor_induk} maxlength="20" class="bidang" />
    </div>

    <div class="flex justify-end gap-3 border-t border-garis pt-5">
      <button type="button" onclick={() => (terbuka = false)} class="tombol-garis">Batal</button>
      <button type="submit" disabled={memproses} class="tombol-utama">
        {memproses ? 'Menyimpan…' : 'Simpan'}
      </button>
    </div>
  </form>
</Modal>
