<!-- SheetTitle.svelte -->
<script>
  export let className = '';
</script>

<h2 id="sheet-title" class="sheet-title {className}">
  <slot />
</h2>

<style>
  .sheet-title {
    font-family: var(--font-family-heading);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--popup-foreground);
    margin: 0;
  }
</style>
