<script lang="ts">
  export let className: string = "";
</script>

<h2 class="modal-title {className}" {...$$restProps}>
  <slot />
</h2>

<style>
  .modal-title {
    font-family: var(--font-family-heading, inherit);
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--popup-foreground, #000);
    margin-bottom: var(--spacing-2, 0.5rem);
    margin-top: 0;
  }
</style>