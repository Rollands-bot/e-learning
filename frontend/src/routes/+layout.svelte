<script>
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <title>Sistem E-Learning UNIPI</title>
</svelte:head>

{@render children()}
