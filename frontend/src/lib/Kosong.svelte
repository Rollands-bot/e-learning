<script>
  /** Keadaan kosong yang seragam untuk seluruh tabel dan daftar. */
  let { pesan, saran = '' } = $props();
</script>

<div class="border border-dashed border-garis-2 px-6 py-14 text-center">
  <div class="text-[15px] font-medium text-tinta-2">{pesan}</div>
  {#if saran}<div class="mt-1.5 text-[13px] text-tinta-3">{saran}</div>{/if}
</div>
