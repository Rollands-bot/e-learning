<script>
  /** Lencana kecil untuk status pengumpulan dan peran pengguna. */
  let { label, kelas = '' } = $props();
</script>

<span
  class="inline-flex items-center border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.09em] whitespace-nowrap {kelas}"
>
  {label}
</span>
