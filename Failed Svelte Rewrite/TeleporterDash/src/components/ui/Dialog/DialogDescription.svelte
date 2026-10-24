<script lang="ts">
  export let className: string = "";
</script>

<p class="modal-description {className}" {...$$restProps}>
  <slot />
</p>

<style>
  .modal-description {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--muted-foreground, #6c757d);
    margin-bottom: var(--spacing-6, 1.5rem);
    margin-top: 0;
  }
</style>
