<!-- SheetHeader.svelte -->
<script>
  export let className = '';
</script>

<div class="sheet-header {className}">
  <slot />
</div>

<style>
  .sheet-header {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
    padding: var(--spacing-6);
    padding-right: var(--spacing-12);
    border-bottom: 1px solid var(--border);
  }
</style>
