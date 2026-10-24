<!-- SheetFooter.svelte -->
<script>
  export let className = '';
</script>

<div class="sheet-footer {className}">
  <slot />
</div>

<style>
  .sheet-footer {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
    margin-top: auto;
    padding: var(--spacing-6);
    border-top: 1px solid var(--border);
  }
</style>
