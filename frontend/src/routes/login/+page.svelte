<script>
  import { goto } from '$app/navigation';
  import { api, sesi } from '$lib/api.js';
  import Peringatan from '$lib/Peringatan.svelte';

  let email = $state('');
  let password = $state('');
  let galat = $state('');
  let memproses = $state(false);

  $effect(() => {
    if (sesi.masuk()) goto('/dasbor', { replaceState: true });
  });

  async function kirim(e) {
    e.preventDefault();
    galat = '';
    memproses = true;
    try {
      const r = await api.login(email.trim().toLowerCase(), password);
      sesi.simpan(r.data.token, r.data.user);
      await goto('/dasbor', { replaceState: true });
    } catch (err) {
      galat = err.message;
    } finally {
      memproses = false;
    }
  }
</script>

<div class="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
  <!-- Panel identitas -->
  <div class="relative hidden flex-col justify-between overflow-hidden bg-pinus p-14 text-kertas lg:flex">
    <div
      class="pointer-events-none absolute -top-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-pinus-2 opacity-50 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-oker opacity-15 blur-3xl"
    ></div>

    <div class="relative flex items-center gap-4">
      <img
        src="/logo-unipi.png"
        alt="Logo Universitas Insan Pembangunan Indonesia"
        class="h-20 w-20 shrink-0"
      />
      <div>
        <div class="text-[11px] font-semibold tracking-[0.28em] text-kertas/50 uppercase">
          Universitas Insan Pembangunan Indonesia
        </div>
        <div class="mt-4 h-px w-16 bg-oker"></div>
      </div>
    </div>

    <div class="relative max-w-lg">
      <h1 class="font-serif text-[58px] leading-[0.98] font-semibold text-kertas">
        Sistem<br /><span class="text-oker">E-Learning</span><br />Berbasis Web
      </h1>
      <p class="mt-7 text-[15px] leading-relaxed text-kertas/70">
        Satu tempat untuk distribusi materi perkuliahan, pengumpulan tugas, dan
        penilaian — dikelola secara mandiri oleh institusi.
      </p>
    </div>

    <div class="relative flex gap-10 text-[12px] text-kertas/45">
      {#each ['Materi Terpusat', 'Tugas Tercatat', 'Nilai Terdokumentasi'] as f}
        <div class="flex items-center gap-2">
          <span class="h-1 w-1 rounded-full bg-oker"></span>{f}
        </div>
      {/each}
    </div>
  </div>

  <!-- Form masuk -->
  <div class="flex items-center justify-center px-6 py-14 sm:px-14">
    <div class="w-full max-w-[400px] masuk">
      <div class="lg:hidden">
        <div class="font-serif text-[30px] leading-tight font-semibold">E-Learning UNIPI</div>
        <div class="mt-5 mb-9 h-px w-14 bg-oker"></div>
      </div>

      <h2 class="font-serif text-[32px] leading-tight font-semibold">Masuk ke sistem</h2>
      <p class="mt-2 mb-8 text-[14px] text-tinta-2">
        Gunakan surel dan kata sandi yang diberikan administrator.
      </p>

      <form onsubmit={kirim} class="space-y-5">
        {#if galat}<Peringatan pesan={galat} />{/if}

        <div>
          <label class="label-bidang" for="email">Surel</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            autocomplete="username"
            placeholder="nama@unipem.ac.id"
            class="bidang"
          />
        </div>

        <div>
          <label class="label-bidang" for="password">Kata Sandi</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="bidang"
          />
        </div>

        <button type="submit" disabled={memproses} class="tombol-utama w-full !py-3">
          {memproses ? 'Memproses…' : 'Masuk'}
        </button>
      </form>

      <p class="mt-9 border-t border-garis pt-5 text-[12.5px] leading-relaxed text-tinta-3">
        Sistem tidak menyediakan pendaftaran mandiri. Akun dosen dan mahasiswa
        dibuat oleh administrator.
      </p>
    </div>
  </div>
</div>
