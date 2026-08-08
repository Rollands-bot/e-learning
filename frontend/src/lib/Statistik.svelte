<script>
  /** Kartu angka ringkasan pada dasbor. */
  let { angka, label, keterangan = '', aksen = false } = $props();
</script>

<div class="kartu p-5 {aksen ? 'border-pinus/25 bg-pinus-3' : ''}">
  <div class="font-serif text-[40px] leading-none font-semibold {aksen ? 'text-pinus' : 'text-tinta'}">
    {angka}
  </div>
  <div class="mt-3 text-[12px] font-semibold tracking-[0.12em] text-tinta-3 uppercase">{label}</div>
  {#if keterangan}
    <div class="mt-1.5 text-[13px] text-tinta-2">{keterangan}</div>
  {/if}
</div>
