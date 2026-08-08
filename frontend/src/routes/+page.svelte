<script>
  import { goto } from '$app/navigation';
  import { sesi } from '$lib/api.js';

  $effect(() => {
    goto(sesi.masuk() ? '/dasbor' : '/login', { replaceState: true });
  });
</script>

<div class="flex min-h-screen items-center justify-center text-[14px] text-tinta-3">Mengalihkan…</div>
