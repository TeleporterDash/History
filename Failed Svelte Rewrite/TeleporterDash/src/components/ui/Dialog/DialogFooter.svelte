<script lang="ts">
  export let className: string = "";
</script>

<div class="footer-section {className}" {...$$restProps}>
  <slot />
</div>

<style>
  .footer-section {
    display: flex;
    gap: var(--spacing-4, 1rem);
    justify-content: flex-end;
    margin-top: var(--spacing-8, 2rem);
  }
</style>