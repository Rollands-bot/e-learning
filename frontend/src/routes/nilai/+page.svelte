<script>
  import { api } from '$lib/api.js';
  import { tanggal, STATUS } from '$lib/format.js';
  import Cangkang from '$lib/Cangkang.svelte';
  import Lencana from '$lib/Lencana.svelte';
  import Kosong from '$lib/Kosong.svelte';

  let rekap = $state([]);
  let memuat = $state(true);

  // Rata-rata keseluruhan dihitung dari seluruh tugas yang sudah dinilai
  // lintas mata kuliah, bukan rata-rata dari rata-rata per mata kuliah.
  let dinilai = $derived(rekap.flatMap((r) => r.daftar).filter((b) => b.nilai !== null));
  let rataKeseluruhan = $derived(
    dinilai.length ? (dinilai.reduce((n, b) => n + b.nilai, 0) / dinilai.length).toFixed(1) : '—'
  );
  let adaTugas = $derived(rekap.some((r) => r.jumlah_tugas > 0));

  $effect(() => {
    api
      .nilaiSaya()
      .then((r) => (rekap = r.data ?? []))
      .finally(() => (memuat = false));
  });
</script>

<Cangkang judul="Nilai" keterangan="Rekapitulasi nilai dan umpan balik dosen atas tugas yang telah dikumpulkan.">
  {#if memuat}
    <div class="py-16 text-center text-[14px] text-tinta-3">Memuat…</div>
  {:else if !adaTugas}
    <Kosong pesan="Belum ada tugas" saran="Nilai akan muncul setelah dosen membuat dan menilai tugas." />
  {:else}
    <!-- Gambar 4.15 — Halaman Nilai Mahasiswa -->
    <div class="mb-7 flex flex-wrap items-center gap-x-10 gap-y-4 border border-pinus/25 bg-pinus-3 px-6 py-5">
      <div>
        <div class="label-bidang !mb-1">Rata-rata Keseluruhan</div>
        <div class="font-serif text-[38px] leading-none font-semibold text-pinus">{rataKeseluruhan}</div>
      </div>
      <div class="h-10 w-px bg-pinus/20"></div>
      <div class="text-[13.5px] text-tinta-2">
        <strong class="font-semibold">{dinilai.length}</strong> tugas sudah dinilai dari
        <strong class="font-semibold">{rekap.reduce((n, r) => n + r.jumlah_tugas, 0)}</strong> tugas keseluruhan
      </div>
    </div>

    <div class="space-y-8">
      {#each rekap.filter((r) => r.jumlah_tugas > 0) as r (r.mata_kuliah.id)}
        <section>
          <div class="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <span class="font-mono text-[12px] font-medium text-oker">{r.mata_kuliah.kode}</span>
              <h2 class="mt-0.5 font-serif text-[20px] font-semibold">{r.mata_kuliah.nama}</h2>
            </div>
            <div class="text-[13.5px] text-tinta-2">
              Rata-rata mata kuliah:
              <strong class="font-serif text-[17px] font-semibold text-pinus">
                {r.rata_rata !== null ? r.rata_rata.toFixed(1) : '—'}
              </strong>
            </div>
          </div>

          <div class="kartu overflow-x-auto">
            <table class="w-full text-[14px]">
              <thead class="border-b border-garis bg-kertas-2">
                <tr class="text-left text-[11px] font-semibold tracking-[0.1em] text-tinta-3 uppercase">
                  <th class="px-5 py-3.5">Tugas</th>
                  <th class="px-5 py-3.5">Dikumpulkan</th>
                  <th class="px-5 py-3.5">Status</th>
                  <th class="px-5 py-3.5">Nilai</th>
                  <th class="px-5 py-3.5">Umpan Balik</th>
                </tr>
              </thead>
              <tbody>
                {#each r.daftar as b (b.tugas.id)}
                  <tr class="border-b border-garis/60 align-top transition-colors last:border-0 hover:bg-kertas-2/60">
                    <td class="px-5 py-3.5">
                      <a href="/tugas/{b.tugas.id}" class="font-medium hover:text-pinus hover:underline">{b.tugas.judul}</a>
                      <div class="mt-0.5 text-[12.5px] text-tinta-3">
                        Batas waktu {tanggal(b.tugas.batas_waktu)}
                      </div>
                    </td>
                    <td class="px-5 py-3.5 whitespace-nowrap text-tinta-2">
                      {b.waktu_kumpul ? tanggal(b.waktu_kumpul) : '—'}
                    </td>
                    <td class="px-5 py-3.5">
                      <Lencana label={STATUS[b.status].label} kelas={STATUS[b.status].kelas} />
                    </td>
                    <td class="px-5 py-3.5 whitespace-nowrap">
                      {#if b.nilai !== null}
                        <span class="font-serif text-[19px] font-semibold text-pinus">{b.nilai}</span>
                        <span class="text-[12.5px] text-tinta-3">/ {b.nilai_maksimum}</span>
                      {:else}
                        <span class="text-tinta-3">—</span>
                      {/if}
                    </td>
                    <td class="max-w-md px-5 py-3.5 text-[13.5px] leading-relaxed text-tinta-2">
                      {b.umpan_balik || '—'}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </section>
      {/each}
    </div>
  {/if}
</Cangkang>
