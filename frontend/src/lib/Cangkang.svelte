<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { sesi, api } from './api.js';
  import { PERAN } from './format.js';
  import Lencana from './Lencana.svelte';

  let { judul, keterangan = '', aksi, children } = $props();

  let user = $state(sesi.user());
  let siap = $state(false);

  // Menu ditentukan peran: setiap aktor hanya melihat menu miliknya (Tabel 4.3).
  const MENU = {
    administrator: [
      { url: '/dasbor', label: 'Dasbor' },
      { url: '/pengguna', label: 'Data Pengguna' },
      { url: '/mata-kuliah', label: 'Data Mata Kuliah' }
    ],
    dosen: [
      { url: '/dasbor', label: 'Dasbor' },
      { url: '/mata-kuliah', label: 'Mata Kuliah Diampu' }
    ],
    mahasiswa: [
      { url: '/dasbor', label: 'Dasbor' },
      { url: '/mata-kuliah', label: 'Mata Kuliah' },
      { url: '/nilai', label: 'Nilai' }
    ]
  };

  let menu = $derived(MENU[user?.peran] ?? []);

  /**
   * Inisial untuk avatar, diambil dari nama pengguna.
   *
   * Gelar dan singkatan dilewati karena selalu memuat titik — tanpa
   * penyaringan ini "Dr. Budi Santoso" akan berinisial "DB", bukan "BS".
   */
  let inisial = $derived.by(() => {
    const kata = (user?.nama ?? '')
      .split(/[\s,]+/)
      .filter((k) => k && !k.includes('.') && k.length > 1);
    if (kata.length === 0) return '—';
    if (kata.length === 1) return kata[0].slice(0, 2).toUpperCase();
    return (kata[0][0] + kata[1][0]).toUpperCase();
  });

  $effect(() => {
    if (!sesi.masuk()) {
      goto('/login');
      return;
    }
    // Profil disegarkan dari API agar perubahan data oleh administrator
    // (misalnya peran atau status) langsung tercermin di antarmuka.
    api
      .saya()
      .then((r) => {
        user = r.data;
        sesi.perbaruiUser(r.data);
      })
      .catch(() => {})
      .finally(() => (siap = true));
  });
</script>

<div class="flex min-h-screen">
  <!-- Bilah samping -->
  <aside class="hidden w-72 shrink-0 flex-col bg-pinus text-kertas md:flex">
    <div class="flex items-center gap-3 border-b border-white/10 px-6 py-6">
      <img
        src="/logo-unipi.png"
        alt="Logo Universitas Insan Pembangunan Indonesia"
        class="h-11 w-11 shrink-0"
      />
      <div>
        <div class="font-serif text-[21px] leading-none font-semibold">E-Learning</div>
        <div class="mt-1.5 text-[11px] font-semibold tracking-[0.2em] text-kertas/45 uppercase">
          Unipi
        </div>
      </div>
    </div>

    <nav class="flex-1 px-3 py-5">
      {#each menu as m}
        {@const aktif = page.url.pathname === m.url || page.url.pathname.startsWith(m.url + '/')}
        <a
          href={m.url}
          class="mb-0.5 flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium transition-colors
                 {aktif ? 'bg-kertas text-pinus' : 'text-kertas/70 hover:bg-white/10 hover:text-kertas'}"
        >
          <span class="h-1.5 w-1.5 rounded-full {aktif ? 'bg-oker' : 'bg-kertas/25'}"></span>
          {m.label}
        </a>
      {/each}
    </nav>

    <div class="border-t border-white/10 p-4">
      <div class="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-3">
        <div
          class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-oker
                 font-serif text-[14px] font-semibold text-kertas"
          aria-hidden="true"
        >
          {inisial}
        </div>

        <div class="min-w-0 flex-1">
          <div class="truncate text-[13.5px] font-semibold leading-tight">{user?.nama ?? '—'}</div>
          <div class="mt-0.5 truncate text-[11.5px] text-kertas/45">{user?.email ?? ''}</div>
        </div>

        <button
          onclick={() => sesi.keluar()}
          title="Keluar dari sistem"
          aria-label="Keluar dari sistem"
          class="grid h-8 w-8 shrink-0 place-items-center rounded-md text-kertas/50
                 transition-colors hover:bg-white/10 hover:text-oker"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  </aside>

  <!-- Isi -->
  <div class="min-w-0 flex-1">
    <header class="border-b border-garis bg-white/70 px-6 py-6 backdrop-blur-sm md:px-10 md:py-8">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <h1 class="judul-bagian">{judul}</h1>
          {#if keterangan}
            <p class="mt-1.5 max-w-2xl text-[14px] text-tinta-2">{keterangan}</p>
          {/if}
        </div>
        <div class="flex shrink-0 items-center gap-3">
          {#if user?.peran}
            <Lencana label={PERAN[user.peran]?.label} kelas={PERAN[user.peran]?.kelas} />
          {/if}
          {#if aksi}{@render aksi()}{/if}
        </div>
      </div>
    </header>

    <main class="px-6 py-7 md:px-10 md:py-9">
      {#if siap}
        <div class="masuk">{@render children()}</div>
      {:else}
        <div class="py-20 text-center text-[14px] text-tinta-3">Memuat…</div>
      {/if}
    </main>
  </div>
</div>
