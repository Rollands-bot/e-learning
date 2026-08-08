<script>
  /** Pesan galat atau berhasil di atas form. */
  let { pesan = '', jenis = 'galat' } = $props();

  const gaya = {
    galat: 'border-bata/30 bg-bata-2 text-bata',
    berhasil: 'border-pinus/30 bg-pinus-3 text-pinus'
  };
</script>

{#if pesan}
  <div class="border px-4 py-3 text-[14px] font-medium masuk {gaya[jenis]}" role="alert">
    {pesan}
  </div>
{/if}
