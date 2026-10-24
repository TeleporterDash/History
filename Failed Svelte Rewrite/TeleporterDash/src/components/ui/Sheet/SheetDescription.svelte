<!-- SheetDescription.svelte -->
<script>
  export let className = '';
</script>

<p id="sheet-description" class="sheet-description {className}">
  <slot />
</p>

<style>
  .sheet-description {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    line-height: 1.5;
    margin: 0;
  }
</style>
