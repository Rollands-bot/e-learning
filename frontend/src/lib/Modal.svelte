<script>
  /** Dialog form untuk tambah/ubah data. */
  let { judul, terbuka = $bindable(false), children } = $props();
</script>

{#if terbuka}
  <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta/45 p-4 py-10 backdrop-blur-[2px]">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="absolute inset-0" onclick={() => (terbuka = false)}></div>

    <div class="relative w-full max-w-lg border border-garis-2 bg-kertas shadow-[6px_6px_0_0_var(--color-tinta)] masuk">
      <div class="flex items-center justify-between border-b border-garis px-6 py-4">
        <h2 class="font-serif text-[21px] font-semibold">{judul}</h2>
        <button
          onclick={() => (terbuka = false)}
          aria-label="Tutup"
          class="text-[22px] leading-none text-tinta-3 transition-colors hover:text-tinta"
        >&times;</button>
      </div>
      <div class="px-6 py-6">{@render children()}</div>
    </div>
  </div>
{/if}
