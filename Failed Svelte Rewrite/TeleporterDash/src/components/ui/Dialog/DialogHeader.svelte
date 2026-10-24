<script lang="ts">
  export let className: string = "";
</script>

<div class="header-section {className}" {...$$restProps}>
  <slot />
</div>

<style>
  .header-section {
    margin-bottom: var(--spacing-4, 1rem);
  }
</style>
